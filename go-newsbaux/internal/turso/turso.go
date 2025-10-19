package turso

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"newsbaux.com/worker/internal/config"
	"newsbaux.com/worker/internal/models"
)

func ConnectTurso() *sql.DB {
	var urlBuffer strings.Builder
	urlBuffer.WriteString(config.GetEnv().TursoDatabaseUrl)
	urlBuffer.WriteString("?authToken=")
	urlBuffer.WriteString(config.GetEnv().TursoAuthToken)

	db, err := sql.Open("libsql", urlBuffer.String())
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to open db %s: %s", urlBuffer.String(), err)
	}

	db.SetConnMaxIdleTime(9 * time.Second)

	return db
}

func InsertArticle(article models.Article, db *sql.DB) {
	var qBuffer strings.Builder
	qBuffer.WriteString("INSERT INTO articles ")
	qBuffer.WriteString("(dataSourceId, title, contents, url, summary) ")
	qBuffer.WriteString("VALUES (?, ?, ?, ?, ? )")
	_, err := db.Exec(qBuffer.String(), article.Id, article.DataSourceId, article.Title, article.Contents, article.Url, article.Summary)
	if err != nil {
		fmt.Printf("error inserting data: %s", err)
	}
}

func GetArticleByDataSourceIdAfterRetrievalDate(dataSourceId string, retrievalDate string, db *sql.DB) []models.Article {
	var res []models.Article

	rows, err := db.Query("SELECT * FROM articles WHERE dataSourceId = ? AND retrievalDate > ?", dataSourceId, retrievalDate)
	if err != nil {
		fmt.Printf("error querying data: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		var article models.Article
		if err := rows.Scan(&article.Id, &article.DataSourceId, &article.Title, &article.Contents, &article.Url, &article.RetrievalDate, &article.Summary); err != nil {
			fmt.Printf("error scanning row: %s", err)
		}

		res = append(res, article)
	}
	if err := rows.Err(); err != nil {
		fmt.Printf("error iterating rows: %s", err)
	}
	return res
}

func InsertEdition(edition models.Edition, db *sql.DB) string {
	var id string = uuid.New().String()
	var qBuffer strings.Builder
	qBuffer.WriteString("INSERT INTO editions")
	qBuffer.WriteString("(id, newsletterId, contents, publishDate) ")
	qBuffer.WriteString("VALUES (?, ?, ?, ?)")
	_, err := db.Exec(qBuffer.String(), id, edition.NewsletterId, edition.Contents, edition.PublishDate)
	if err != nil {
		fmt.Printf("error inserting data: %s", err)
	}
	return id
}

func GetEditionByNewsletterId(newsletterId string, db *sql.DB) []models.Edition {
	var res []models.Edition

	rows, err := db.Query("SELECT * FROM editions WHERE newsletterId = ?", newsletterId)
	if err != nil {
		fmt.Printf("error querying data: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		var ed models.Edition
		if err := rows.Scan(&ed.Id, &ed.NewsletterId, &ed.Contents, &ed.PublishDate); err != nil {
			fmt.Printf("error scanning row: %s", err)
		}

		res = append(res, ed)
	}
	if err := rows.Err(); err != nil {
		fmt.Printf("error iterating rows: %s", err)
	}
	return res
}

func InsertEditionSection(editionSection models.EditionSection, db *sql.DB) {
	var qBuffer strings.Builder
	qBuffer.WriteString("INSERT INTO editionsSection")
	qBuffer.WriteString("(editionId, newsSectionId, content) ")
	qBuffer.WriteString("VALUES (?, ?, ? )")
	_, err := db.Exec(qBuffer.String(), editionSection.Id, editionSection.EditionId, editionSection.NewsSectionId, editionSection.Content)
	if err != nil {
		fmt.Printf("error inserting data: %s", err)
	}
}

func GetEditionSectionByEdition(editionId string, db *sql.DB) []models.EditionSection {
	var res []models.EditionSection

	rows, err := db.Query("SELECT * FROM editionsSection WHERE editionId = ?", editionId)
	if err != nil {
		fmt.Printf("error querying data: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		var es models.EditionSection
		if err := rows.Scan(&es.Id, &es.EditionId, &es.NewsSectionId, &es.Content, &es.PublishDate); err != nil {
			fmt.Printf("error scanning row: %s", err)
		}

		res = append(res, es)
	}
	if err := rows.Err(); err != nil {
		fmt.Printf("error iterating rows: %s", err)
	}
	return res
}

func GetNewsletterByNextSendDate(nextSendDate string, hour int, db *sql.DB) []models.Newsletter {
	var res []models.Newsletter

	rows, err := db.Query("SELECT * FROM newsletters WHERE nextSendDate <= ? AND hour <=?",
		nextSendDate, hour)
	if err != nil {
		fmt.Printf("error querying data: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		var newsletter models.Newsletter
		if err := rows.Scan(&newsletter.Id, &newsletter.Email, &newsletter.Name,
			&newsletter.Cadence, &newsletter.SendTime, &newsletter.UpdatedAt, &newsletter.
				NextSendDate); err != nil {
			fmt.Printf("error scanning row: %s", err)
		}

		res = append(res, newsletter)
	}
	if err := rows.Err(); err != nil {
		fmt.Printf("error iterating rows: %s", err)
	}
	return res
}

func GetNewsSectionByNewsletterId(newsletterId string, db *sql.DB) []models.NewsSection {
	var res []models.NewsSection

	rows, err := db.Query("SELECT * FROM newsSection WHERE newsId = ?", newsletterId)
	if err != nil {
		fmt.Printf("error querying data: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		var ns models.NewsSection
		if err := rows.Scan(&ns.Id, &ns.Email, &ns.NewsId, &ns.Title, &ns.SystemPrompt,
			&ns.DataSources); err != nil {
			fmt.Printf("error scanning row: %s", err)
		}

		res = append(res, ns)
	}
	if err := rows.Err(); err != nil {
		fmt.Printf("error iterating rows: %s", err)
	}
	return res
}
