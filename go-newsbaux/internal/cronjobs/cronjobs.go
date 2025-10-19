package cronjobs

import (
	"context"
	"fmt"
	"github.com/robfig/cron/v3"
)

type CronJob interface {
	Name() string
	Schedule() string
	Run(ctx context.Context) error
}

type JobManager struct {
	Cron    *cron.Cron
	Jobs    []CronJob
	Context context.Context
}

func InitJobManager(ctx context.Context) *JobManager {
	return &JobManager{
		Cron:    cron.New(cron.WithSeconds()),
		Jobs:    []CronJob{},
		Context: ctx,
	}
}

func (jm *JobManager) RegisterJob(job CronJob) {
	jm.Jobs = append(jm.Jobs, job)
}

func (jm *JobManager) StartScheduler() {
	for _, job := range jm.Jobs {
		schedule := job.Schedule()
		if _, err := jm.Cron.AddFunc(schedule, func() {
			if err := job.Run(jm.Context); err != nil {
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

func (m HalfHourJob) Run(ctx context.Context) error {
	//TODO: Implement logic
	return nil
}
