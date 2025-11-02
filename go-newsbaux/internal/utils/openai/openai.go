package openai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"newsbaux.com/worker/internal/config"
	"newsbaux.com/worker/internal/utils"
	"time"
)

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

type OpenAiService struct {
	Client *http.Client
}

func InitOpenAiService(client *http.Client) *OpenAiService {
	return &OpenAiService{
		Client: client,
	}
}

func (oaService *OpenAiService) AiChooseArticles(sysPrompt string, titles []string) []string {
	inputData := OpenAiResponsesDataTitle{
		Model: "gpt-4-turbo",
		Inputs: []OpenAiInput{
			{
				Role:    "system",
				Content: sysPrompt,
			},
			{
				Role:    "user",
				Content: fmt.Sprintf("Select the most relevant articles from: %v", titles),
			},
		},
		Text: TitleTextConfig{
			Format: TitleTextFormat{
				Type:        "json_schema",
				Name:        "article_selection",
				Description: "Selected article titles",
				Strict:      true,
				Schema: TitleJsonSchema{
					Type: "object",
					Properties: TitleSchemaProperties{
						Titles: SchemaProperty{
							Type: "array",
							Items: SchemaItems{
								Type: "string",
							},
						},
					},
					AdditionalProperties: false,
					Required:             []string{"titles"},
				},
			},
		},
	}

	jsonString, err := json.Marshal(inputData)
	if err != nil {
		fmt.Printf("error creating openai json: %s\n", err)
		return nil
	}

	req, err := http.NewRequest(http.MethodPost,
		"https://api.openai.com/v1/chat/completions",
		bytes.NewReader(jsonString))
	if err != nil {
		fmt.Printf("error sending post request to openai: %s\n", err)
		return nil
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+config.GetEnv().OpenAiApiKey)

	res, err := utils.MakeRequestWithRetry(oaService.Client, req, 3)
	if err != nil {
		fmt.Printf("error making http request: %s\n", err)
		return nil
	}

	reqBody, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Printf("could not read request body: %s\n", err)
		return nil
	}

	// TODO: Unmarshal response body and extract selected titles
	// var body OpenAiChatCompletionResponse
	// err = json.Unmarshal(reqBody, &body)
	// if err != nil {
	// 	fmt.Printf("cannot unmarshal openai response: %s\n", err)
	// 	return nil
	// }

	_ = reqBody // Use the variable to avoid unused error
	time.Sleep(time.Second * 8)

	return []string{} // Placeholder return
}
