package main

import (
	"log"
	"os"

	"aksara/pkg/database"
	"aksara/project-service/internal/handler"
	"aksara/project-service/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: File .env tidak ditemukan")
	}

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
		log.Fatalf("Project Service gagal terhubung ke DB: %v", err)
	}

	log.Println("Menjalankan Auto Migration Project...")
	db.AutoMigrate(&repository.Project{})

	r := gin.Default()
	projectHandler := handler.ProjectHandler{DB: db}

	// ==========================================
	// ROUTE PROJECT SERVICE
	// ==========================================
	r.POST("/projects", projectHandler.CreateProject)
	r.GET("/projects", projectHandler.GetProjects)        // Tambahan route GET All Projects
	r.GET("/projects/:id", projectHandler.GetProjectByID) // Tambahan route GET Detail Project
	r.PUT("/projects/:id", projectHandler.UpdateProject)

	log.Println("✅ Aksara Project Service berjalan di port 8082...")
	r.Run(":8082")
}
