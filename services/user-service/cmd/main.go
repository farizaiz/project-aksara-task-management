package main

import (
	"log"
	"os"

	"aksara/pkg/database"
	"aksara/user-service/internal/handler" // Import handler yang baru dibuat
	"aksara/user-service/internal/repository"

	"github.com/gin-gonic/gin" // Import framework Gin
	"github.com/joho/godotenv"
)

func main() {
	// 1. Load file .env
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

	// ==========================================
	// INISIALISASI SERVER HTTP (GIN-GONIC)
	// ==========================================

	// 3. Inisialisasi framework Gin dengan konfigurasi default
	r := gin.Default()

	// 4. Inisialisasi Handler dengan menyuntikkan (inject) koneksi database
	authHandler := handler.AuthHandler{DB: db}

	// 5. Definisi Route untuk Endpoint Registrasi
	r.POST("/register", authHandler.Register)
	r.POST("/login", authHandler.Login)

	// 6. Jalankan Server di Port 8081
	log.Println("✅ Aksara User Service siap menerima request di port 8081...")
	r.Run(":8081")
}
