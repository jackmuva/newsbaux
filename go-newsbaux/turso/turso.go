package turso

import (
	"database/sql"
	"fmt"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"os"
	"strings"
	"time"
	"worker/newsbaux/utils"
)

func ConnectTurso() *sql.DB {
	var urlBuffer strings.Builder
	urlBuffer.WriteString(utils.GetEnv().TursoDatabaseUrl)
	urlBuffer.WriteString("?authToken=")
	urlBuffer.WriteString(utils.GetEnv().TursoAuthToken)

	db, err := sql.Open("libsql", urlBuffer.String())
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to open db %s: %s", urlBuffer.String(), err)
	}

	db.SetConnMaxIdleTime(9 * time.Second)

	return db
}

type Article struct {
	Id            string
	DataSourceId  string
	Title         string
	Contents      string
	Url           string
	RetrievalDate string
	Summary       string
}

func InsertArticle(article Article, db *sql.DB) {
	var qBuffer strings.Builder
	qBuffer.WriteString("INSERT INTO articles ")
	qBuffer.WriteString("(id, dataSourceId, title, contents, url, summary) ")
	qBuffer.WriteString("VALUES (?, ?, ?, ?, ?, ? )")
	_, err := db.Exec(qBuffer.String(), article.Id, article.DataSourceId, article.Title, article.Contents, article.Url, article.Summary)
	if err != nil {
		fmt.Printf("error inserting data: %s", err)
	}
}

type Edition struct {
	Id           string
	NewsletterId string
	Contents     string
	PublishDate  string
}

func InsertEdition(edition Edition, db *sql.DB) {
	var qBuffer strings.Builder
	qBuffer.WriteString("INSERT INTO editions")
	qBuffer.WriteString("(id, newsletterId, contents) ")
	qBuffer.WriteString("VALUES (?, ?, ? )")
	_, err := db.Exec(qBuffer.String(), edition.Id, edition.NewsletterId, edition.Contents)
	if err != nil {
		fmt.Printf("error inserting data: %s", err)
	}
}

func GetEditionByNewsletterId(newsletterId string, db *sql.DB) []Edition {
	var res []Edition

	rows, err := db.Query("SELECT * FROM editions WHERE newsletterId = ?", newsletterId)
	if err != nil {
		fmt.Printf("error querying data: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		var ed Edition
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

type EditionSection struct {
	Id            string
	EditionId     string
	NewsSectionId string
	Content       string
	PublishDate   string
}

func InsertEditionSection(editionSection EditionSection, db *sql.DB) {
	var qBuffer strings.Builder
	qBuffer.WriteString("INSERT INTO editionsSection")
	qBuffer.WriteString("(id, editionId, newsSectionId, content) ")
	qBuffer.WriteString("VALUES (?, ?, ?, ? )")
	_, err := db.Exec(qBuffer.String(), editionSection.Id, editionSection.EditionId, editionSection.NewsSectionId, editionSection.Content)
	if err != nil {
		fmt.Printf("error inserting data: %s", err)
	}
}

func GetEditionSectionByEdition(editionId string, db *sql.DB) []EditionSection {
	var res []EditionSection

	rows, err := db.Query("SELECT * FROM editionsSection WHERE editionId = ?", editionId)
	if err != nil {
		fmt.Printf("error querying data: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		var es EditionSection
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
