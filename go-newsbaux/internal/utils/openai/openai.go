package openai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"newsbaux.com/worker/internal/config"
	"newsbaux.com/worker/internal/models/openaimodels"
	"newsbaux.com/worker/internal/utils"
)

type OpenAiService struct {
	Client *http.Client
}

func InitOpenAiService(client *http.Client) *OpenAiService {
	return &OpenAiService{
		Client: client,
	}
}

func (oaService *OpenAiService) AiChooseArticles(sysPrompt string, titles []string) []string {
	inputData := openaimodels.OpenAiResponsesDataTitle{
		Model: "gpt-5-mini",
		Inputs: []openaimodels.OpenAiInput{
			{
				Role:    "system",
				Content: sysPrompt,
			},
			{
				Role:    "user",
				Content: fmt.Sprintf("Select the most relevant articles from: %v", titles),
			},
		},
		Text: openaimodels.TitleTextConfig{
			Format: openaimodels.TitleTextFormat{
				Type:        "json_schema",
				Name:        "article_selection",
				Description: "Selected article titles",
				Strict:      true,
				Schema: openaimodels.TitleJsonSchema{
					Type: "object",
					Properties: openaimodels.TitleSchemaProperties{
						Titles: openaimodels.SchemaProperty{
							Type: "array",
							Items: openaimodels.SchemaItems{
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
	var body openaimodels.OpenAiChatCompletionResponseTitles
	err = json.Unmarshal(reqBody, &body)
	if err != nil {
		fmt.Printf("cannot unmarshal openai response: %s\n", err)
		return nil
	}

	_ = reqBody // Use the variable to avoid unused error

	return nil
}
