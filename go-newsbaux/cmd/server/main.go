package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"newsbaux.com/worker/internal/cronjobs"
	"newsbaux.com/worker/internal/middleware"
	"newsbaux.com/worker/internal/turso"
	"os"
	"os/signal"
	"syscall"
)

func healthcheck(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got healthcheck request\n")
	io.WriteString(w, "This is vimnotion\n")
}

func main() {
	tursoDb := turso.ConnectTurso()
	defer tursoDb.Close()

	//CRON JOB SCHEDULE
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChannel := make(chan os.Signal, 1)
	signal.Notify(sigChannel, os.Interrupt, syscall.SIGTERM)

	jm := cronjobs.InitJobManager(ctx)
	jm.RegisterJob(cronjobs.HalfHourJob{})

	go jm.StartScheduler()

	//WEB SERVER
	mux := http.NewServeMux()
	mux.HandleFunc("/", healthcheck)
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
