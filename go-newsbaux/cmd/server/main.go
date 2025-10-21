package main

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"newsbaux.com/worker/internal/cronjobs"
	"newsbaux.com/worker/internal/cronjobs/daily"
	"newsbaux.com/worker/internal/cronjobs/halfhour"
	"newsbaux.com/worker/internal/handlers"
	"newsbaux.com/worker/internal/middleware"
	"newsbaux.com/worker/internal/turso"
)

func main() {
	tursoDb := turso.ConnectTurso()
	defer tursoDb.Close()

	//CRON JOB SCHEDULE
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChannel := make(chan os.Signal, 1)
	signal.Notify(sigChannel, os.Interrupt, syscall.SIGTERM)

	client := http.Client{
		Timeout: 30 * time.Second,
	}

	jm := cronjobs.InitJobManager(ctx, &client, tursoDb)
	jm.RegisterJob(halfhour.HalfHourJob{})
	jm.RegisterJob(daily.DailyJob{})

	go jm.StartScheduler()

	//WEB SERVER
	mux := http.NewServeMux()
	mux.HandleFunc("/", handlers.HealthCheck)
	corsHandler := middleware.EnableCors(mux)

	webCtx := context.Background()
	server := &http.Server{
		Addr:    ":3333",
		Handler: corsHandler,
		BaseContext: func(l net.Listener) context.Context {
			webCtx = context.WithValue(webCtx, "newsbaux-worker", l.Addr().String())
			return webCtx
		},
	}

	go func() {
		err := server.ListenAndServe()
		if errors.Is(err, http.ErrServerClosed) {
			fmt.Printf("server closed\n")
		} else if err != nil {
			fmt.Printf("error listening for server: %s\n", err)
		}
	}()

	<-sigChannel
	fmt.Println("Received shutdown signal")
	cancel()
	server.Shutdown(webCtx)
}
