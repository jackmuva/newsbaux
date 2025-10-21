package utils

import (
	"fmt"
	"net"
	"net/http"
	"time"
)

func MakeRequestWithRetry(client *http.Client, req *http.Request, maxRetries int) (*http.Response, error) {
	var lastErr error

	for attempt := 0; attempt <= maxRetries; attempt++ {
		resp, err := client.Do(req)
		if err == nil {
			if resp.StatusCode >= 400 {
				resp.Body.Close()
				if attempt < maxRetries && isRetryableError(resp.StatusCode) {
					time.Sleep(time.Duration(attempt+1) * time.Second)
					continue
				}
				return nil, fmt.Errorf("HTTP error: %d %s", resp.StatusCode, resp.Status)
			}
			return resp, nil
		}

		lastErr = err

		// Check if error is retryable
		if attempt < maxRetries && isRetryableNetworkError(err) {
			time.Sleep(time.Duration(attempt+1) * time.Second)
			continue
		}

		break
	}

	return nil, fmt.Errorf("request failed after %d attempts: %w", maxRetries+1, lastErr)
}

func isRetryableError(statusCode int) bool {
	return statusCode == 429 || statusCode == 502 || statusCode == 503 || statusCode == 504
}

func isRetryableNetworkError(err error) bool {
	if netErr, ok := err.(net.Error); ok {
		return netErr.Timeout()
	}
	return false
}
