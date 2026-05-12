package main

import (
	"log"
	"os"

	"aksara/comment-service/internal/handler"
	"aksara/comment-service/internal/repository"
	"aksara/pkg/broker" // Tambahkan import pkg broker
	"aksara/pkg/database"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: File .env tidak ditemukan")
	}

	// 1. Setup Koneksi Database
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
		log.Fatalf("Comment Service gagal terhubung ke DB: %v", err)
	}

	log.Println("Menjalankan Auto Migration Comment...")
	db.AutoMigrate(&repository.Comment{})

	// 2. Setup Koneksi RabbitMQ
	rabbitURL := os.Getenv("RABBITMQ_URL")
	rabbitConn, err := broker.ConnectRabbitMQ(rabbitURL)
	if err != nil {
		log.Printf("Peringatan: Gagal terhubung ke RabbitMQ: %v (Fitur notifikasi tidak akan berjalan)", err)
	} else {
		defer rabbitConn.Close()
	}

	r := gin.Default()

	// 3. Inisialisasi Handler dengan menyuntikkan koneksi DB & RabbitMQ
	commentHandler := handler.CommentHandler{
		DB:         db,
		RabbitConn: rabbitConn, // Suntikkan koneksi RabbitMQ
	}

	r.POST("/comments", commentHandler.CreateComment)

	log.Println("✅ Aksara Comment Service berjalan di port 8084...")
	r.Run(":8084")
}
