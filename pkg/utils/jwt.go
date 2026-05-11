package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// GenerateToken membuat JWT baru yang berisi ID pengguna dan masa berlaku
func GenerateToken(userID string, secret string) (string, error) {
	// Membuat payload (klaim)
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // Token berlaku 24 jam
	}

	// Membuat token dengan algoritma HS256
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Menandatangani token dengan secret key
	return token.SignedString([]byte(secret))
}
