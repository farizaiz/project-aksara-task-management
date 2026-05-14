package main

import (
	"log"
	"os"

	"aksara/pkg/broker"
	"aksara/pkg/database"
	"aksara/task-service/internal/handler"
	"aksara/task-service/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: File .env tidak ditemukan")
	}

	// 1. Connect ke Database
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
		log.Fatalf("Task Service gagal terhubung ke DB: %v", err)
	}

	log.Println("Menjalankan Auto Migration Task...")
	db.AutoMigrate(&repository.Task{})

	// 2. Connect ke RabbitMQ
	rabbitURL := os.Getenv("RABBITMQ_URL")
	rabbitConn, err := broker.ConnectRabbitMQ(rabbitURL)
	if err != nil {
		log.Printf("Peringatan: Gagal terhubung ke RabbitMQ: %v (Fitur notifikasi tidak akan berjalan)", err)
	} else {
		defer rabbitConn.Close()
	}

	r := gin.Default()

	// 3. Inisialisasi Handler dengan menyuntikkan koneksi DB & RabbitMQ
	taskHandler := handler.TaskHandler{
		DB:         db,
		RabbitConn: rabbitConn,
	}

	r.POST("/tasks", taskHandler.CreateTask)
	r.GET("/tasks", taskHandler.GetTasks)

	r.PUT("/tasks/:id", taskHandler.UpdateTaskStatus)

	log.Println("✅ Aksara Task Service berjalan di port 8083...")
	r.Run(":8083")
}
