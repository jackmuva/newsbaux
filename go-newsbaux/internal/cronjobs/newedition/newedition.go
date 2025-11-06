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
	"newsbaux.com/worker/internal/utils/openai"
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

func WriteNewsletters(ctx context.Context, newsletters []models.Newsletter, date string, db *sql.DB, oaService *openai.OpenAiService) {
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
			WriteSections(ctx, sections, date, db, oaService)
		}(newsletter)
	}
	newsWg.Wait()
}

func WriteSections(ctx context.Context, sections []models.NewsSection, date string, db *sql.DB, oaService *openai.OpenAiService) {
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

			selectedDataSourceMap := SelectArticles(ctx, dataSources, section.SystemPrompt, date, db, oaService)
		}(section, db)
	}
	secWg.Wait()
}

type DataSourceMap struct {
	DataSourceId  string
	ArticleTitles []string
}

func SelectArticles(ctx context.Context, dataSources []models.DataSources, sysPrompt string, date string, db *sql.DB, oaService *openai.OpenAiService) []DataSourceMap {
	var dataSourceMaps []DataSourceMap

	for _, dataSource := range dataSources {
		var titles []string
		articles := turso.GetArticleByDataSourceIdAfterRetrievalDate(dataSource.Id, date, db)
		for _, article := range articles {
			titles = append(titles, article.Title)
		}
		selectedTitles := oaService.AiChooseArticles(sysPrompt, titles)
		dataSourceMaps = append(dataSourceMaps, DataSourceMap{
			DataSourceId:  dataSource.Id,
			ArticleTitles: selectedTitles,
		})

		// time.Sleep(8 * time.Second)
	}
	return dataSourceMaps
}

func (m HalfHourNewEditionJob) Run(ctx context.Context, client *http.Client, db *sql.DB, oaService *openai.OpenAiService) error {
	date, hour := GetDayAndHour()
	newsletters := turso.GetNewsletterByNextSendDate(date, hour, db)

	WriteNewsletters(ctx, newsletters, date, db, oaService)
	return nil
}
