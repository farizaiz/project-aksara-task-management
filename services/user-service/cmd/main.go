package main

import (
	"aksara/pkg/database"
	"aksara/user-service/internal/repository"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// 1. Load file .env
	// Jika file .env tidak ditemukan, log akan berhenti di sini
	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: File .env tidak ditemukan, menggunakan environment system")
	}

	// 2. Ambil nilai dari environment variables
	dbConfig := database.Config{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		SSLMode:  "disable",
	}

	db, err := database.ConnectDB(dbConfig)
	if err != nil {
		log.Fatalf("User Service gagal terhubung ke DB: %v", err)
	}

	log.Println("Menjalankan Auto Migration...")
	db.AutoMigrate(&repository.User{})

	log.Println("✅ Aksara User Service berjalan!")
}
