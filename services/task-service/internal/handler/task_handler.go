package handler

import (
	"net/http"

	"aksara/task-service/internal/repository"

	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm"
)

type TaskHandler struct {
	DB         *gorm.DB
	RabbitConn *amqp.Connection
}

// ==========================================
// CREATE TASK
// ==========================================
func (h *TaskHandler) CreateTask(c *gin.Context) {
	// Tambahkan Label ke penangkap JSON
	var input struct {
		Title       string  `json:"title" binding:"required"`
		Description string  `json:"description"`
		ProjectID   string  `json:"project_id" binding:"required"`
		Status      string  `json:"status"`
		Label       *string `json:"label"` // Tangkap label saat Create
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	taskStatus := input.Status
	if taskStatus == "" {
		taskStatus = "To Do"
	}

	task := repository.Task{
		Title:       input.Title,
		Description: input.Description,
		ProjectID:   input.ProjectID,
		Status:      taskStatus,
		Label:       input.Label, // Simpan label
	}

	if err := h.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan tugas"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Tugas berhasil dibuat!", "data": task})
}

// ==========================================
// GET TASKS
// ==========================================
func (h *TaskHandler) GetTasks(c *gin.Context) {
	var tasks []repository.Task

	if err := h.DB.Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat daftar tugas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil memuat tugas",
		"data":    tasks,
	})
}

// ==========================================
// UPDATE TASK (DINAMIS - VERSI MAP)
// ==========================================
func (h *TaskHandler) UpdateTaskStatus(c *gin.Context) {
	id := c.Param("id")

	// 1. Gunakan map untuk menangkap data persis apa adanya dari Frontend (termasuk nilai null)
	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
		return
	}

	// 2. Pastikan tugasnya ada di database
	var task repository.Task
	if err := h.DB.First(&task, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tugas tidak ditemukan"})
		return
	}

	// 3. Keajaiban GORM: Updates() menggunakan map akan langsung mengaplikasikan
	// nilai null ke kolom yang tepat di database secara otomatis!
	if err := h.DB.Model(&task).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui tugas"})
		return
	}

	// 4. Tarik data terbaru dari DB setelah di-update agar dikembalikan ke Frontend
	h.DB.First(&task, "id = ?", id)

	c.JSON(http.StatusOK, gin.H{
		"message": "Tugas berhasil diperbarui",
		"data":    task,
	})
}

// ==========================================
// DELETE TASK
// ==========================================
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	id := c.Param("id")

	if err := h.DB.Where("id = ?", id).Delete(&repository.Task{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus tugas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tugas berhasil dihapus"})
}
