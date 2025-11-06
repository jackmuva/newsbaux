package openaimodels

type OpenAiInput struct {
	Role    string
	Content string
}

type SchemaItems struct {
	Type string
}

type SchemaProperty struct {
	Type  string
	Items SchemaItems
}

type TitleSchemaProperties struct {
	Titles SchemaProperty
}

type TitleJsonSchema struct {
	Type                 string
	Properties           TitleSchemaProperties
	AdditionalProperties bool
	Required             []string
}

type TitleTextFormat struct {
	Type        string
	Name        string
	Description string
	Strict      bool
	Schema      TitleJsonSchema
}

type TitleTextConfig struct {
	Format TitleTextFormat
}

type OpenAiResponsesDataTitle struct {
	Model  string
	Inputs []OpenAiInput
	Text   TitleTextConfig
}

type OpenAiChatCompletionResponseTitles struct {
}
