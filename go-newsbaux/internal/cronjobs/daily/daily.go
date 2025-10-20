package daily

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"newsbaux.com/worker/internal/models"
	"newsbaux.com/worker/internal/turso"
	"strings"
	"sync"
	"time"
)

type DailyJob struct{}

func (m DailyJob) Name() string {
	return "DailyJob"
}

func (m DailyJob) Schedule() string {
	return "0 0 9 * * *"
}

func getCurrentDateAndHour() (string, int) {
	date := strings.Split(time.Now().UTC().Format(time.RFC3339), "T")[0]
	hour := time.Now().UTC().Hour()
	return date, hour
}

func collectDataSourceUrls(dataSourceMap *sync.Map) []string {
	var urlArray []string
	dataSourceMap.Range(func(key any, value any) bool {
		fmt.Printf("key: %s, val: %s\n", key, value)
		urlArray = append(urlArray, key.(string))
		return true
	})
	return urlArray
}

func processDataSources(ctx context.Context, dataSources []models.DataSources, date string, db *sql.DB, dataSourceMap *sync.Map) {
	const maxDataSourceWorkers = 5
	dsSem := make(chan struct{}, maxDataSourceWorkers)
	var dsWg sync.WaitGroup

	for _, dataSource := range dataSources {
		dsWg.Add(1)
		go func(dataSource models.DataSources, db *sql.DB) {
			defer dsWg.Done()
			dsSem <- struct{}{}
			defer func() { <-dsSem }()

			select {
			case <-ctx.Done():
				return
			default:
				articles := turso.GetArticleByDataSourceIdAfterRetrievalDate(dataSource.Id, date, db)
				if len(articles) < 1 {
					dataSourceMap.Store(dataSource.Url, true)
				}
			}
		}(dataSource, db)
	}
	dsWg.Wait()
}

func processSections(ctx context.Context, sections []models.NewsSection, date string, db *sql.DB, dataSourceMap *sync.Map) {
	const maxSectionWorkers = 5
	var sectionWg sync.WaitGroup
	sectionSem := make(chan struct{}, maxSectionWorkers)

	for _, section := range sections {
		sectionWg.Add(1)
		go func(section models.NewsSection, db *sql.DB) {
			defer sectionWg.Done()
			sectionSem <- struct{}{}
			defer func() { <-sectionSem }()

			var dataSources []models.DataSources
			json.Unmarshal([]byte(section.DataSources), &dataSources)

			processDataSources(ctx, dataSources, date, db, dataSourceMap)
		}(section, db)
	}
	sectionWg.Wait()
}

func processNewsletters(ctx context.Context, newsletters []models.Newsletter, date string, db *sql.DB) *sync.Map {
	const maxNewsletterWorkers = 5
	var newsWg sync.WaitGroup
	newsletterSem := make(chan struct{}, maxNewsletterWorkers)
	var dataSourceMap sync.Map

	for _, newsletter := range newsletters {
		newsWg.Add(1)
		go func(newsletter models.Newsletter) {
			defer newsWg.Done()

			newsletterSem <- struct{}{}
			defer func() { <-newsletterSem }()

			sections := turso.GetNewsSectionByNewsletterId(newsletter.Id, db)
			processSections(ctx, sections, date, db, &dataSourceMap)
		}(newsletter)
	}

	newsWg.Wait()
	return &dataSourceMap
}

func (m DailyJob) Run(ctx context.Context, db *sql.DB) error {
	date, hour := getCurrentDateAndHour()
	newsletters := turso.GetNewsletterByNextSendDate(date, hour, db)

	dataSourceMap := processNewsletters(ctx, newsletters, date, db)
	urlArray := collectDataSourceUrls(dataSourceMap)

	for _, url := range urlArray {
		fmt.Print(url)
	}

	return nil
}
