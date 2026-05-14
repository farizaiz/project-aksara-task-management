package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"aksara/task-service/internal/repository"

	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm"
)

type TaskHandler struct {
	DB         *gorm.DB
	RabbitConn *amqp.Connection // Tambahan: Menampung koneksi RabbitMQ
}

func (h *TaskHandler) CreateTask(c *gin.Context) {
	var input struct {
		Title       string  `json:"title" binding:"required"`
		Description string  `json:"description"`
		ProjectID   string  `json:"project_id" binding:"required"`
		AssigneeID  *string `json:"assignee_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task := repository.Task{
		Title:       input.Title,
		Description: input.Description,
		ProjectID:   input.ProjectID,
		AssigneeID:  input.AssigneeID,
	}

	// Simpan ke PostgreSQL
	if err := h.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan task"})
		return
	}

	// ==========================================
	// PUBLISH EVENT KE RABBITMQ
	// ==========================================
	if h.RabbitConn != nil {
		ch, err := h.RabbitConn.Channel()
		if err == nil {
			defer ch.Close()

			// Siapkan payload event (format JSON)
			eventData, _ := json.Marshal(map[string]interface{}{
				"task_id":    task.ID,
				"title":      task.Title,
				"project_id": task.ProjectID,
				"created_at": task.CreatedAt,
			})

			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			// Lempar pesan ke antrean target
			ch.PublishWithContext(ctx,
				"",                   // exchange
				"task_created_queue", // routing key (nama antrean target)
				false,                // mandatory
				false,                // immediate
				amqp.Publishing{
					ContentType: "application/json",
					Body:        eventData,
				})
		}
	}
	// ==========================================

	// Kembalikan respons instan ke client (tanpa menunggu proses notifikasi selesai)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Task berhasil dibuat!",
		"data":    task,
	})
}

// Fungsi untuk mengambil daftar tugas
func (h *TaskHandler) GetTasks(c *gin.Context) {
	var tasks []repository.Task

	// Mengambil semua data tugas dari database
	// Di masa depan, ini bisa difilter berdasarkan project_id atau user_id
	if err := h.DB.Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat daftar tugas"})
		return
	}

	// Mengembalikan respons dengan key "data" (Sesuai yang diharapkan frontend)
	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil memuat tugas",
		"data":    tasks,
	})
}

// Fungsi untuk memperbarui status tugas (Drag & Drop)
func (h *TaskHandler) UpdateTaskStatus(c *gin.Context) {
	// 1. Ambil ID tugas dari parameter URL
	id := c.Param("id")

	// 2. Siapkan wadah untuk menangkap status baru dari frontend
	var input struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
		return
	}

	// 3. Cari tugas berdasarkan ID di database
	var task repository.Task
	if err := h.DB.First(&task, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tugas tidak ditemukan"})
		return
	}

	// 4. Perbarui statusnya dan simpan kembali ke database
	task.Status = input.Status
	if err := h.DB.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status tugas"})
		return
	}

	// 5. Berikan respons sukses
	c.JSON(http.StatusOK, gin.H{
		"message": "Status tugas berhasil diperbarui",
		"data":    task,
	})
}
