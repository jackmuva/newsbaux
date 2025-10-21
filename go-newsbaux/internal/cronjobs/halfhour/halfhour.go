package halfhour

import (
	"context"
	"database/sql"
	"net/http"
)

type HalfHourJob struct{}

func (m HalfHourJob) Name() string {
	return "HalfHourJob"
}

func (m HalfHourJob) Schedule() string {
	return "0 */30 * * * *"
}

func (m HalfHourJob) Run(ctx context.Context, client *http.Client, db *sql.DB) error {
	return nil
}
