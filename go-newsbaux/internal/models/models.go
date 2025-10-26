package models

import "time"

type Article struct {
	Id            string
	DataSourceId  string
	Title         string
	Contents      string
	Url           string
	RetrievalDate string
	Summary       string
}

type Edition struct {
	Id           string
	NewsletterId string
	Contents     string
	PublishDate  string
}

type EditionSection struct {
	Id            string
	EditionId     string
	NewsSectionId string
	Content       string
	PublishDate   string
}

type Newsletter struct {
	Id           string
	Email        string
	Name         string
	Cadence      int
	SendTime     int
	UpdatedAt    *time.Time
	NextSendDate string
}

type NewsSection struct {
	Id           string
	Email        string
	NewsId       string
	Title        string
	SystemPrompt string
	DataSources  string
}

type DataSources struct {
	Id       string
	Email    string
	Url      string
	Name     string
	Standard int
}
