package utils

import (
	"fmt"
	"github.com/joho/godotenv"
	"os"
	"sync"
)

type EnvVars struct {
	AuthSecret       string
	FrontendBaseUrl  string
	TursoDatabaseUrl string
	TursoAuthToken   string
}

var envVars *EnvVars
var once sync.Once

func GetEnv() *EnvVars {
	once.Do(func() {
		err := godotenv.Load()
		if err != nil {
			fmt.Printf("Error loading .env file")
		}

		envVars = &EnvVars{
			AuthSecret:       os.Getenv("AUTH_SECRET"),
			FrontendBaseUrl:  os.Getenv("FRONTEND_BASE_URL"),
			TursoDatabaseUrl: os.Getenv("TURSO_DATABASE_URL"),
			TursoAuthToken:   os.Getenv("TURSO_AUTH_TOKEN"),
		}
	})
	return envVars
}
