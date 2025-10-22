package newedition

import (
	"context"
	"database/sql"
	"net/http"
)

type HalfHourNewEditionJob struct{}

func (m HalfHourNewEditionJob) Name() string {
	return "HalfHourNewEditionJob"
}

func (m HalfHourNewEditionJob) Schedule() string {
	return "0 */30 * * * *"
}

func (m HalfHourNewEditionJob) Run(ctx context.Context, client *http.Client, db *sql.DB) error {
	return nil
}
