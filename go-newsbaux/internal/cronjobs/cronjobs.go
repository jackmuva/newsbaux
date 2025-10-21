package cronjobs

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/robfig/cron/v3"
)

type CronJob interface {
	Name() string
	Schedule() string
	Run(ctx context.Context, client *http.Client, db *sql.DB) error
}

type JobManager struct {
	Cron    *cron.Cron
	Jobs    []CronJob
	Context context.Context
	Db      *sql.DB
	Client  *http.Client
}

func InitJobManager(ctx context.Context, client *http.Client, db *sql.DB) *JobManager {
	return &JobManager{
		Cron:    cron.New(cron.WithSeconds()),
		Jobs:    []CronJob{},
		Context: ctx,
		Db:      db,
		Client:  client,
	}
}

func (jm *JobManager) RegisterJob(job CronJob) {
	jm.Jobs = append(jm.Jobs, job)
}

func (jm *JobManager) StartScheduler() {
	for _, job := range jm.Jobs {
		schedule := job.Schedule()
		if _, err := jm.Cron.AddFunc(schedule, func() {
			if err := job.Run(jm.Context, jm.Client, jm.Db); err != nil {
				fmt.Printf("Error in job %s, %s", job.Name(), err)
			}
		}); err != nil {
			fmt.Printf("Failed to schedule job: %s, %s", job.Name(), err)
		}
	}
	jm.Cron.Start()
}
