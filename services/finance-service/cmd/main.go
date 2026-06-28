package main

import (
	"log"
	"os"

	"aksara/pkg/database"
	"aksara/finance-service/internal/handler"
	"aksara/finance-service/internal/repository"

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
		log.Fatalf("Finance Service gagal terhubung ke DB: %v", err)
	}

	log.Println("Menjalankan Auto Migration Finance...")
	db.AutoMigrate(&repository.FinanceCategory{}, &repository.FinanceTransaction{}, &repository.FinanceMonthlyBudget{}, &repository.FinanceMonthlyCategoryBudget{})

	r := gin.Default()

	// 2. Inisialisasi Handler dengan menyuntikkan koneksi DB
	financeHandler := handler.FinanceHandler{
		DB: db,
	}

	financeGroup := r.Group("/finance")
	{
		financeGroup.GET("/categories", financeHandler.GetCategories)
		financeGroup.POST("/categories", financeHandler.CreateCategory)
		financeGroup.PUT("/categories/:id", financeHandler.UpdateCategory)
		financeGroup.DELETE("/categories/:id", financeHandler.DeleteCategory)

		financeGroup.GET("/transactions", financeHandler.GetTransactions)
		financeGroup.POST("/transactions", financeHandler.CreateTransaction)
		financeGroup.DELETE("/transactions/:id", financeHandler.DeleteTransaction)

		financeGroup.GET("/budgets", financeHandler.GetBudgets)
		financeGroup.POST("/budgets", financeHandler.UpsertBudget)

		financeGroup.GET("/category-budgets", financeHandler.GetCategoryBudgets)
		financeGroup.POST("/category-budgets", financeHandler.UpsertCategoryBudget)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}
	log.Printf("✅ Aksara Finance Service berjalan di port %s...", port)
	r.Run(":" + port)
}
