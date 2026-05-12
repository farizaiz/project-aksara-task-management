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

func (h *ProjectHandler) CreateProject(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
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

	project := repository.Project{
		Name:        input.Name,
		Description: input.Description,
		OwnerID:     ownerID,
	}

	if err := h.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan project"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Project berhasil dibuat!", "data": project})
}
