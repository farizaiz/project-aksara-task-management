package main

import (
	"log"
	"os"

	"aksara/pkg/database"
	"aksara/task-service/internal/handler"
	"aksara/task-service/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Load Environment Variables
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: File .env tidak ditemukan")
	}

	// 2. Setup Database Config
	dbConfig := database.Config{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		SSLMode:  "disable",
	}

	// 3. Connect to Database
	db, err := database.ConnectDB(dbConfig)
	if err != nil {
		log.Fatalf("Task Service gagal terhubung ke DB: %v", err)
	}

	// 4. Auto Migrate Table Task
	log.Println("Menjalankan Auto Migration Task...")
	db.AutoMigrate(&repository.Task{})

	// 5. Setup Gin Router
	r := gin.Default()

	// Inisialisasi Handler dengan menyuntikkan (inject) koneksi database
	taskHandler := handler.TaskHandler{DB: db}

	// Daftarkan route untuk membuat task
	r.POST("/tasks", taskHandler.CreateTask)

	// 6. Run Server
	log.Println("✅ Aksara Task Service berjalan di port 8083...")
	r.Run(":8083")
}
