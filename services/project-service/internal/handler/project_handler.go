package handler

import (
	"net/http"

	"aksara/project-service/internal/repository" // Sesuaikan dengan nama modul Anda

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProjectHandler struct {
	DB *gorm.DB
}

// ==========================================
// 1. CREATE PROJECT
// ==========================================
func (h *ProjectHandler) CreateProject(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Meta        string `json:"meta"`
		BgColor     string `json:"bg_color"`
		IconColor   string `json:"icon_color"`
		Columns     string `json:"columns"`
		Labels      string `json:"labels"` // Menangkap custom label jika ada
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ambil ID User dari Header yang sudah disisipkan oleh API Gateway
	ownerID := c.GetHeader("X-User-Id")
	if ownerID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak terautentikasi"})
		return
	}

	// Set nilai default untuk UI jika frontend tidak mengirimkannya
	columns := input.Columns
	if columns == "" {
		columns = `[{"id": "To Do", "title": "To Do", "color": "#71717A"}, {"id": "In Progress", "title": "In Progress", "color": "#CA8A04"}, {"id": "Done", "title": "Done", "color": "#16A34A"}]`
	}

	// Default susunan Label awal jika kosong (Sesuai dengan UI Frontend Anda)
	labels := input.Labels
	if labels == "" {
		labels = `[{"id": "label-1", "name": "Tahap 1", "color": "#DC2626", "bg": "#FEE2E2"}, {"id": "label-2", "name": "Tahap 2", "color": "#D97706", "bg": "#FEF3C7"}, {"id": "label-3", "name": "Tahap 3", "color": "#CA8A04", "bg": "#FEF08A"}, {"id": "label-4", "name": "Tahap 4", "color": "#16A34A", "bg": "#DCFCE7"}, {"id": "label-5", "name": "Tahap 5", "color": "#2563EB", "bg": "#DBEAFE"}]`
	}

	bgColor := input.BgColor
	if bgColor == "" {
		bgColor = "#F4F4F5"
	}
	iconColor := input.IconColor
	if iconColor == "" {
		iconColor = "#71717A"
	}

	project := repository.Project{
		Name:        input.Name,
		Description: input.Description,
		OwnerID:     ownerID,
		Meta:        input.Meta,
		BgColor:     bgColor,
		IconColor:   iconColor,
		Columns:     columns,
		Labels:      &labels, // Menggunakan pointer *string sesuai struct di repository
	}

	if err := h.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan project"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Project berhasil dibuat!", "data": project})
}

// ==========================================
// 2. GET ALL PROJECTS (Milik User yang Login)
// ==========================================
func (h *ProjectHandler) GetProjects(c *gin.Context) {
	ownerID := c.GetHeader("X-User-Id")
	if ownerID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak terautentikasi"})
		return
	}

	var projects []repository.Project
	// Hanya ambil project yang OwnerID-nya sesuai dengan ID dari token
	if err := h.DB.Where("owner_id = ?", ownerID).Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data project"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Berhasil memuat project", "data": projects})
}

// ==========================================
// 3. GET PROJECT BY ID
// ==========================================
func (h *ProjectHandler) GetProjectByID(c *gin.Context) {
	id := c.Param("id")
	ownerID := c.GetHeader("X-User-Id")
	if ownerID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak terautentikasi"})
		return
	}

	var project repository.Project
	// Keamanan tambahan: Pastikan ID sesuai DAN project itu milik user tersebut
	if err := h.DB.Where("id = ? AND owner_id = ?", id, ownerID).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project tidak ditemukan atau Anda tidak memiliki akses"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Detail project ditemukan", "data": project})
}

// ==========================================
// UPDATE PROJECT (DINAMIS UNTUK KOLOM & LABEL)
// ==========================================
func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	id := c.Param("id")
	ownerID := c.GetHeader("X-User-Id")

	// 1. Tangkap seluruh payload secara dinamis (Bisa berisi "columns", "labels", "name", dll)
	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var project repository.Project
	if err := h.DB.Where("id = ? AND owner_id = ?", id, ownerID).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project tidak ditemukan"})
		return
	}

	// 2. PERBAIKAN: Gunakan Updates() dengan map.
	// Ini akan otomatis mengaplikasikan apapun yang dikirim Frontend
	// (misal hanya mengirim "labels") langsung tertimpa ke kolom yang benar di DB.
	if err := h.DB.Model(&project).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate project"})
		return
	}

	// 3. Ambil ulang data segar dari DB setelah berhasil di-update
	h.DB.Where("id = ?", id).First(&project)

	c.JSON(http.StatusOK, gin.H{"message": "Project berhasil diupdate", "data": project})
}
