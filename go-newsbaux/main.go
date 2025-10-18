package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
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

	mux := http.NewServeMux()
	mux.HandleFunc("/", healthcheck)
	corsHandler := middleware.EnableCors(mux)

	ctx := context.Background()
	server := &http.Server{
		Addr:    ":3333",
		Handler: corsHandler,
		BaseContext: func(l net.Listener) context.Context {
			ctx = context.WithValue(ctx, "newsbaux-worker", l.Addr().String())
			return ctx
		},
	}
	err := server.ListenAndServe()
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("server closed\n")
	} else if err != nil {
		fmt.Printf("error listening for server: %s\n", err)
	}
}
