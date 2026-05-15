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
		// Default susunan kolom kanban awal jika kosong
		columns = `[{"id": "To Do", "title": "To Do", "color": "#71717A"}, {"id": "In Progress", "title": "In Progress", "color": "#CA8A04"}, {"id": "Done", "title": "Done", "color": "#16A34A"}]`
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
// UPDATE PROJECT (Untuk Simpan Kolom Dinamis)
// ==========================================
func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	id := c.Param("id")
	ownerID := c.GetHeader("X-User-Id")

	var input struct {
		Columns string `json:"columns"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var project repository.Project
	if err := h.DB.Where("id = ? AND owner_id = ?", id, ownerID).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project tidak ditemukan"})
		return
	}

	// PERBAIKAN: Gunakan Model().Update() agar GORM secara paksa dan spesifik
	// menimpa kolom JSONB di PostgreSQL, menghindari bug dari fungsi Save()
	if err := h.DB.Model(&project).Update("columns", input.Columns).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate project"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project berhasil diupdate", "data": project})
}
