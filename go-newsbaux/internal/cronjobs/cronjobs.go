package cronjobs

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/robfig/cron/v3"
	"newsbaux.com/worker/internal/utils/openai"
)

// TODO:refactor this so that oaService is optional
type CronJob interface {
	Name() string
	Schedule() string
	Run(ctx context.Context, client *http.Client, db *sql.DB, oaService *openai.OpenAiService) error
}

type JobManager struct {
	Cron          *cron.Cron
	Jobs          []CronJob
	Context       context.Context
	Db            *sql.DB
	Client        *http.Client
	OpenAiService *openai.OpenAiService
}

func InitJobManager(ctx context.Context, client *http.Client, db *sql.DB, oaService *openai.OpenAiService) *JobManager {
	return &JobManager{
		Cron:          cron.New(cron.WithSeconds()),
		Jobs:          []CronJob{},
		Context:       ctx,
		Db:            db,
		Client:        client,
		OpenAiService: oaService,
	}
}

func (jm *JobManager) RegisterJob(job CronJob) {
	jm.Jobs = append(jm.Jobs, job)
}

func (jm *JobManager) StartScheduler() {
	for _, job := range jm.Jobs {
		schedule := job.Schedule()
		if _, err := jm.Cron.AddFunc(schedule, func() {
			if err := job.Run(jm.Context, jm.Client, jm.Db, jm.OpenAiService); err != nil {
				fmt.Printf("Error in job %s, %s", job.Name(), err)
			}
		}); err != nil {
			fmt.Printf("Failed to schedule job: %s, %s", job.Name(), err)
		}
	}
	jm.Cron.Start()
}
