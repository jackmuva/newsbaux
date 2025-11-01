package indexdata

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"newsbaux.com/worker/internal/config"
	"newsbaux.com/worker/internal/models"
	"newsbaux.com/worker/internal/turso"
	"newsbaux.com/worker/internal/utils"
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
					dataSourceMap.Store(dataSource.Url, dataSource.Id)
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

type FirecrawlUrlResponse struct {
	Url          string
	DataSourceId string
	Response     FirecrawlMapResponse
}

func CollectFirecrawlReponses(dataSourceMap *sync.Map, client *http.Client) []FirecrawlUrlResponse {
	var response []FirecrawlUrlResponse
	dataSourceMap.Range(func(url any, id any) bool {
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

		var body FirecrawlMapResponse
		err = json.Unmarshal(reqBody, &body)
		if err != nil {
			fmt.Printf("cannot unmarshal: %s\n", err)
		}
		response = append(response, FirecrawlUrlResponse{url.(string), id.(string), body})
		time.Sleep(time.Second * 8)
		return true
	})
	return response
}

func IndexArticles(responses []FirecrawlUrlResponse, db *sql.DB, ctx context.Context) {
	const maxWorkers = 5
	indexSem := make(chan struct{}, maxWorkers)
	var indexWg sync.WaitGroup

	for _, res := range responses {
		indexWg.Add(1)
		go func(res FirecrawlUrlResponse, db *sql.DB) {
			defer indexWg.Done()
			indexSem <- struct{}{}
			defer func() { <-indexSem }()
			if res.Response.Success {
				IndexLinks(res.DataSourceId, res.Response.Links, db, ctx)
			}
		}(res, db)
	}
	indexWg.Wait()
}

func IndexLinks(dataSourceId string, links []FirecrawlLinks, db *sql.DB, ctx context.Context) {
	const maxWorkers = 5
	linkSem := make(chan struct{}, maxWorkers)
	var linkWg sync.WaitGroup

	for _, link := range links {
		linkWg.Add(1)
		go func(dsId string, link FirecrawlLinks, db *sql.DB) {
			defer linkWg.Done()
			linkSem <- struct{}{}
			defer func() { <-linkSem }()
			select {
			case <-ctx.Done():
				return
			default:
				turso.InsertArticle(models.Article{
					Id:            uuid.New().String(),
					DataSourceId:  dsId,
					Title:         link.Title,
					Contents:      "",
					Url:           link.Url,
					RetrievalDate: time.Now().UTC().Format(time.RFC3339),
					Summary:       "",
				}, db)
			}
		}(dataSourceId, link, db)
	}
	linkWg.Wait()
}

func (m DailyIndexJob) Run(ctx context.Context, client *http.Client, db *sql.DB) error {

	date, hour := getCurrentDateAndHour()
	fmt.Printf("current date: %s\ncurrent time: %d\n", date, hour)
	newsletters := turso.GetNewsletterByNextSendDate(date, hour, db)
	fmt.Printf("newsletters due: %v\n", newsletters)

	dataSourceMap := processNewsletters(ctx, newsletters, date, db)

	firecrawlResponses := CollectFirecrawlReponses(dataSourceMap, client)
	IndexArticles(firecrawlResponses, db, ctx)

	return nil
}
