package halfhour

import (
	"context"
	"database/sql"
)

type HalfHourJob struct{}

func (m HalfHourJob) Name() string {
	return "HalfHourJob"
}

func (m HalfHourJob) Schedule() string {
	return "0 */30 * * * *"
}

func (m HalfHourJob) Run(ctx context.Context, db *sql.DB) error {
	return nil
}
