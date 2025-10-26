package indexdata

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"newsbaux.com/worker/internal/config"
	"newsbaux.com/worker/internal/models"
	"newsbaux.com/worker/internal/turso"
	"newsbaux.com/worker/internal/utils"
	"strings"
	"sync"
	"time"
)

type DailyIndexJob struct{}

func (m DailyIndexJob) Name() string {
	return "DailyIndexJob"
}

func (m DailyIndexJob) Schedule() string {
	// return "0 0 9 * * *"
	return "*/30 * * * * *"
}

func getCurrentDateAndHour() (string, int) {
	date := strings.Split(time.Now().UTC().Format(time.RFC3339), "T")[0]
	hour := time.Now().UTC().Hour()
	return date, hour
}

func collectDataSourceUrls(dataSourceMap *sync.Map) []string {
	var urlArray []string
	dataSourceMap.Range(func(key any, value any) bool {
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
			fmt.Printf("sections: %v\n", sections)
		}(newsletter)
	}

	newsWg.Wait()
	return &dataSourceMap
}

type FirecrawlLinks struct {
	Url         string `json:"url"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type FirecrawlMapResponse struct {
	Success bool             `json:"success"`
	Links   []FirecrawlLinks `json:"links"`
}

func (m DailyIndexJob) Run(ctx context.Context, client *http.Client, db *sql.DB) error {

	date, hour := getCurrentDateAndHour()
	fmt.Printf("current date: %s\ncurrent time: %d\n", date, hour)
	newsletters := turso.GetNewsletterByNextSendDate(date, hour, db)
	fmt.Printf("newsletters due: %v\n", newsletters)

	dataSourceMap := processNewsletters(ctx, newsletters, date, db)
	urlArray := collectDataSourceUrls(dataSourceMap)

	fmt.Printf("url array: %v\n", urlArray)

	for _, url := range urlArray {
		jsonBody := make(map[string]any)
		jsonBody["url"] = url
		jsonBody["sitemap"] = "skip"

		jsonString, err := json.Marshal(jsonBody)
		if err != nil {
			fmt.Printf("error creating firecrawl json: %s\n", err)
		}

		req, err := http.NewRequest(http.MethodPost,
			"https://api.firecrawl.dev/v2/map",
			bytes.NewReader(jsonString))
		if err != nil {
			fmt.Printf("error sending post request to firecrawl: %s\n", err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+config.GetEnv().FirecrawlApiKey)

		res, err := utils.MakeRequestWithRetry(client, req, 3)
		if err != nil {
			fmt.Printf("error making http request: %s\n", err)
		}
		reqBody, err := io.ReadAll(res.Body)
		if err != nil {
			fmt.Printf("could not read request body: %s\n", err)
		}
		// fmt.Printf("raw firecrawl body: %s\n", string(reqBody[:]))

		var body FirecrawlMapResponse
		err = json.Unmarshal(reqBody, &body)
		if err != nil {
			fmt.Printf("cannot unmarshal: %s\n", err)
		}
		fmt.Printf("marshalled response: %v\n", body)
	}

	return nil
}
