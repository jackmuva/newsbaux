package handlers

import (
	"fmt"
	"io"
	"net/http"
)

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got healthcheck request\n")
	io.WriteString(w, "This is vimnotion\n")
}
