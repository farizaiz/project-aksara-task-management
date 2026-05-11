package handler

import (
	"net/http"
	"os"

	"aksara/pkg/utils"
	"aksara/user-service/internal/repository"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB *gorm.DB
}

// ==========================================
// 1. ENDPOINT REGISTRASI
// ==========================================
func (h *AuthHandler) Register(c *gin.Context) {
	var input struct {
		FullName string `json:"full_name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	// Validasi Input JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hashing Password
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	// Simpan ke Database
	user := repository.User{
		FullName: input.FullName,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	if err := h.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat user atau email sudah terdaftar"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registrasi berhasil!", "user_id": user.ID})
}

// ==========================================
// 2. ENDPOINT LOGIN (BARU)
// ==========================================
func (h *AuthHandler) Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	// Validasi Input JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Cari User Berdasarkan Email
	var user repository.User
	if err := h.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah"})
		return
	}

	// Memverifikasi kecocokan password dengan hash yang ada di database menggunakan bcrypt
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah"})
		return
	}

	// Jika cocok, sistem akan menerbitkan Stateless JWT (JSON Web Token)
	secret := os.Getenv("JWT_SECRET")
	token, err := utils.GenerateToken(user.ID, secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menerbitkan token"})
		return
	}

	// Kembalikan Response Sukses
	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil!",
		"token":   token,
	})
}
