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
	RabbitConn *amqp.Connection // Tambahan: Menampung koneksi RabbitMQ
}

// ==========================================
// CREATE TASK
// ==========================================
func (h *TaskHandler) CreateTask(c *gin.Context) {
	// 1. Tambahkan "Status" di struct penangkap JSON
	var input struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		ProjectID   string `json:"project_id" binding:"required"`
		Status      string `json:"status"` // <--- TAMBAHKAN INI
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Beri nilai default "To Do" HANYA JIKA dari frontend kosong
	taskStatus := input.Status
	if taskStatus == "" {
		taskStatus = "To Do"
	}

	// 3. Masukkan taskStatus ke dalam data yang akan disimpan
	task := repository.Task{
		Title:       input.Title,
		Description: input.Description,
		ProjectID:   input.ProjectID,
		Status:      taskStatus, // <--- GUNAKAN VARIABEL INI, JANGAN DI-HARDCODE "To Do"
	}

	if err := h.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan tugas"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Tugas berhasil dibuat!", "data": task})
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

// ==========================================
// DELETE TASK
// ==========================================
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	id := c.Param("id")

	// GORM otomatis melakukan "Soft Delete" (hanya mengisi kolom deleted_at)
	// Jadi data tidak benar-benar hilang dari database, sangat aman untuk audit!
	if err := h.DB.Where("id = ?", id).Delete(&repository.Task{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus tugas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tugas berhasil dihapus"})
}
