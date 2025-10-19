package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"worker/newsbaux/cronjobs"
	"worker/newsbaux/middleware"
	"worker/newsbaux/turso"
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

	go func() {
		<-sigChannel
		fmt.Println("Received shutdown signal")
		cancel()
	}()

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
	err := server.ListenAndServe()
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("server closed\n")
	} else if err != nil {
		fmt.Printf("error listening for server: %s\n", err)
	}
}
