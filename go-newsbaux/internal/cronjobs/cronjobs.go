package cronjobs

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/robfig/cron/v3"
	"golang.org/x/sync/errgroup"
	"newsbaux.com/worker/internal/models"
	"newsbaux.com/worker/internal/turso"
)

type CronJob interface {
	Name() string
	Schedule() string
	Run(ctx context.Context, db *sql.DB) error
}

type JobManager struct {
	Cron    *cron.Cron
	Jobs    []CronJob
	Context context.Context
	Db      *sql.DB
}

func InitJobManager(ctx context.Context, db *sql.DB) *JobManager {
	return &JobManager{
		Cron:    cron.New(cron.WithSeconds()),
		Jobs:    []CronJob{},
		Context: ctx,
		Db:      db,
	}
}

func (jm *JobManager) RegisterJob(job CronJob) {
	jm.Jobs = append(jm.Jobs, job)
}

func (jm *JobManager) StartScheduler() {
	for _, job := range jm.Jobs {
		schedule := job.Schedule()
		if _, err := jm.Cron.AddFunc(schedule, func() {
			if err := job.Run(jm.Context, jm.Db); err != nil {
				fmt.Printf("Error in job %s, %s", job.Name(), err)
			}
		}); err != nil {
			fmt.Printf("Failed to schedule job: %s, %s", job.Name(), err)
		}
	}
	jm.Cron.Start()
}

type HalfHourJob struct{}

func (m HalfHourJob) Name() string {
	return "HalfHourJob"
}

func (m HalfHourJob) Schedule() string {
	return "0 */30 * * * *"
}

func (m HalfHourJob) Run(ctx context.Context, db *sql.DB) error {
	const maxNewsletterWorkers = 5
	const maxDataSourceWorkers = 10

	var date string = strings.Split(time.Now().UTC().Format(time.RFC3339), "T")[0]
	var hour int = time.Now().UTC().Hour()

	var newsletters []models.Newsletter = turso.GetNewsletterByNextSendDate(date, hour, db)

	g, ctx := errgroup.WithContext(ctx)

	// Newsletter worker pool semaphore
	newsletterSem := make(chan struct{}, maxNewsletterWorkers)

	for _, newsletter := range newsletters {
		newsletter := newsletter // capture loop variable
		g.Go(func() error {
			// Acquire semaphore
			newsletterSem <- struct{}{}
			defer func() { <-newsletterSem }()

			_ = turso.InsertEdition(models.Edition{Id: "", NewsletterId: newsletter.Id, Contents: "", PublishDate: date}, db)
			var sections []models.NewsSection = turso.GetNewsSectionByNewsletterId(newsletter.Id, db)

			for _, section := range sections {
				var dataSources []models.DataSources
				json.Unmarshal([]byte(section.DataSources), &dataSources)

				dataSourceGroup, dataSourceCtx := errgroup.WithContext(ctx)

				// Data source worker pool semaphore
				dataSourceSem := make(chan struct{}, maxDataSourceWorkers)

				for _, dataSource := range dataSources {
					dataSource := dataSource // capture loop variable
					dataSourceGroup.Go(func() error {
						// Acquire semaphore
						dataSourceSem <- struct{}{}
						defer func() { <-dataSourceSem }()

						select {
						case <-dataSourceCtx.Done():
							return dataSourceCtx.Err()
						default:
							var articles []models.Article = turso.GetArticleByDataSourceIdAfterRetrievalDate(dataSource.Id, date, db)
							if len(articles) < 1 {
								//TODO: Firecrawl job
							}
							return nil
						}
					})
				}

				if err := dataSourceGroup.Wait(); err != nil {
					return fmt.Errorf("error processing data sources for section %s: %w", section.Id, err)
				}

				//TODO: AI call to write edition section
			}
			return nil
		})
	}

	// Wait for all newsletter processing to complete
	if err := g.Wait(); err != nil {
		return fmt.Errorf("error processing newsletters: %w", err)
	}

	return nil
}
