package auth

import (
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"newsbaux.com/worker/internal/config"
)

func VerifyJwt(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return []byte(config.GetEnv().AuthSecret), nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return token, nil
}
