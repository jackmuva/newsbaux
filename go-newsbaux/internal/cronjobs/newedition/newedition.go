package newedition

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"

	"newsbaux.com/worker/internal/models"
	"newsbaux.com/worker/internal/turso"
)

type HalfHourNewEditionJob struct{}

func (m HalfHourNewEditionJob) Name() string {
	return "HalfHourNewEditionJob"
}

func (m HalfHourNewEditionJob) Schedule() string {
	return "0 */30 * * * *"
}

func GetDayAndHour() (string, int) {
	date := strings.Split(time.Now().UTC().Format(time.RFC3339), "T")[0]
	hour := time.Now().UTC().Hour()
	return date, hour
}

func WriteNewsletters(ctx context.Context, newsletters []models.Newsletter, date string, db *sql.DB) {
	const maxWorkers = 4
	var newsWg sync.WaitGroup
	newsSem := make(chan struct{}, maxWorkers)
	for _, newsletter := range newsletters {
		newsWg.Add(1)
		go func(newsletter models.Newsletter) {
			defer newsWg.Done()
			newsSem <- struct{}{}
			defer func() { <-newsSem }()

			sections := turso.GetNewsSectionByNewsletterId(newsletter.Id, db)
			WriteSections(ctx, sections, date, db)
		}(newsletter)
	}
	newsWg.Wait()
}

func WriteSections(ctx context.Context, sections []models.NewsSection, date string, db *sql.DB) {
	const maxWorkers = 5
	var secWg sync.WaitGroup
	secSem := make(chan struct{}, maxWorkers)

	for _, section := range sections {
		secWg.Add(1)
		go func(section models.NewsSection, db *sql.DB) {
			defer secWg.Done()
			secSem <- struct{}{}
			defer func() { <-secSem }()

			var dataSources []models.DataSources
			json.Unmarshal([]byte(section.DataSources), &dataSources)
		}(section, db)
	}
	secWg.Wait()
}

func (m HalfHourNewEditionJob) Run(ctx context.Context, client *http.Client, db *sql.DB) error {
	date, hour := GetDayAndHour()
	newsletters := turso.GetNewsletterByNextSendDate(date, hour, db)
	return nil
}
