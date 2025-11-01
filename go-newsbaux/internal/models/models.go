package models

type Article struct {
	Id            string `json:"id"`
	DataSourceId  string `json:"dataSourceId"`
	Title         string `json:"title"`
	Contents      string `json:"contents"`
	Url           string `json:"url"`
	RetrievalDate string `json:"retrievalDate"`
	Summary       string `json:"summary"`
}

type Edition struct {
	Id           string `json:"id"`
	NewsletterId string `json:"newsletterId"`
	Contents     string `json:"contents"`
	PublishDate  string `json:"publishDate"`
}

type EditionSection struct {
	Id            string `json:"id"`
	EditionId     string `json:"editionId"`
	NewsSectionId string `json:"newsSectionId"`
	Content       string `json:"content"`
	PublishDate   string `json:"publishDate"`
}

type Newsletter struct {
	Id           string `json:"id"`
	Email        string `json:"email"`
	Name         string `json:"name"`
	Cadence      int    `json:"cadence"`
	SendTime     int    `json:"sendTime"`
	UpdatedAt    string `json:"updatedAt"`
	NextSendDate string `json:"nextSendDate"`
}

type NewsSection struct {
	Id           string `json:"id"`
	Email        string `json:"email"`
	NewsId       string `json:"newsId"`
	Title        string `json:"title"`
	SystemPrompt string `json:"systemPrompt"`
	DataSources  string `json:"dataSources"`
}

type DataSources struct {
	Id       string `json:"id"`
	Email    string `json:"email"`
	Url      string `json:"url"`
	Name     string `json:"name"`
	Standard int    `json:"standard"`
}
