package openai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"newsbaux.com/worker/internal/config"
	"newsbaux.com/worker/internal/utils"
)

type OpenAiResponsesData struct {
	Model  string
	Inputs []struct {
		Role    string
		Content string
	}
	Text struct {
		Format struct {
			Type        string
			Name        string
			Description string
			Strict      bool
			Schema      struct {
				Type       string
				Properties struct {
					Titles struct {
						Type  string
						Items struct {
							Type string
						}
					}
				}
				AdditionalProperties bool
				Required             []string
			}
		}
	}
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
	var inputData OpenAiResponsesData
	inputData.Model = "gpt-5-nano"

	jsonString, err := json.Marshal(inputData)
	if err != nil {
		fmt.Printf("error creating firecrawl json: %s\n", err)
	}

	req, err := http.NewRequest(http.MethodPost,
		"https://api.openai.com/v1/chat/completions",
		bytes.NewReader(jsonString))
	if err != nil {
		fmt.Printf("error sending post request to openai: %s\n", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+config.GetEnv().OpenAiApiKey)

	res, err := utils.MakeRequestWithRetry(oaService.Client, req, 3)
	if err != nil {
		fmt.Printf("error making http request: %s\n", err)
	}
	reqBody, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Printf("could not read request body: %s\n", err)
	}

	// var body FirecrawlMapResponse
	// err = json.Unmarshal(reqBody, &body)
	// if err != nil {
	// 	fmt.Printf("cannot unmarshal: %s\n", err)
	// }
	time.Sleep(time.Second * 8)

}
