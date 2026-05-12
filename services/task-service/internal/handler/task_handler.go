package handler

import (
	"net/http"

	"aksara/task-service/internal/repository" // Pastikan import path ini sesuai dengan modul Anda

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TaskHandler struct {
	DB *gorm.DB
}

func (h *TaskHandler) CreateTask(c *gin.Context) {
	// 1. Definisikan struktur data yang diharapkan dari JSON (Insomnia/Frontend)
	var input struct {
		Title       string  `json:"title" binding:"required"`
		Description string  `json:"description"`
		ProjectID   string  `json:"project_id" binding:"required"`
		AssigneeID  *string `json:"assignee_id"` // Menggunakan pointer agar bisa menerima null
	}

	// 2. Validasi Input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 3. Susun data untuk disimpan ke Database
	// Catatan: Status tidak diisi di sini karena GORM akan otomatis mengisinya dengan "To Do"
	task := repository.Task{
		Title:       input.Title,
		Description: input.Description,
		ProjectID:   input.ProjectID,
		AssigneeID:  input.AssigneeID,
	}

	// 4. Eksekusi penyimpanan ke PostgreSQL
	if err := h.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan task"})
		return
	}

	// 5. Kembalikan respons sukses
	c.JSON(http.StatusCreated, gin.H{
		"message": "Task berhasil dibuat!",
		"data":    task,
	})
}
