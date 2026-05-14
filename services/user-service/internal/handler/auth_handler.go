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

// ==========================================
// 3. ENDPOINT GET PROFILE (BARU)
// ==========================================
func (h *AuthHandler) GetProfile(c *gin.Context) {
	// API Gateway menitipkan ID User di header ini
	userID := c.GetHeader("X-User-Id")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tidak ada akses"})
		return
	}

	// Cari user di database berdasarkan ID
	var user repository.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Kembalikan data user (TIDAK TERMASUK PASSWORD)
	c.JSON(http.StatusOK, gin.H{
		"message": "Profil berhasil diambil",
		"data": gin.H{
			"id":        user.ID,
			"full_name": user.FullName,
			"email":     user.Email,
			"role":      user.Role, // <--- PASTIKAN BARIS INI ADA
		},
	})
}

// ==========================================
// 4. ENDPOINT UPDATE PROFILE (BARU)
// ==========================================
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	// Ambil ID dari token yang sudah divalidasi API Gateway
	userID := c.GetHeader("X-User-Id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tidak ada akses"})
		return
	}

	// Tangkap input nama baru dari Frontend
	var input struct {
		FullName string `json:"full_name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
		return
	}

	// Cari user di database
	var user repository.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Timpa nama lama dengan nama baru, lalu simpan ke database
	user.FullName = input.FullName
	if err := h.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui nama"})
		return
	}

	// Kembalikan data user (TIDAK TERMASUK PASSWORD)
	c.JSON(http.StatusOK, gin.H{
		"message": "Profil berhasil diambil",
		"data": gin.H{
			"id":        user.ID,
			"full_name": user.FullName,
			"email":     user.Email,
			"role":      user.Role, // <--- TAMBAHKAN BARIS INI
		},
	})
}

// ==========================================
// 5. MIDDLEWARE KHUSUS ADMIN
// ==========================================
func (h *AuthHandler) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetHeader("X-User-Id")
		var user repository.User

		// Cek siapa yang sedang melakukan request
		if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Akses ditolak"})
			c.Abort() // Hentikan proses
			return
		}

		// Jika bukan super_admin, tendang keluar
		if user.Role != "super_admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Area khusus Super Admin"})
			c.Abort() // Hentikan proses
			return
		}

		// Jika dia super_admin, persilakan lewat
		c.Next()
	}
}

// ==========================================
// 6. ENDPOINT ADMIN: LIHAT SEMUA USER
// ==========================================
func (h *AuthHandler) GetAllUsers(c *gin.Context) {
	var users []repository.User

	// Ambil semua data user dari database
	if err := h.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pengguna"})
		return
	}

	// Format respons agar bersih dan aman
	var response []map[string]interface{}
	for _, u := range users {
		response = append(response, map[string]interface{}{
			"id":         u.ID,
			"full_name":  u.FullName,
			"email":      u.Email,
			"role":       u.Role,
			"created_at": u.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Daftar pengguna berhasil diambil",
		"data":    response,
	})
}

// ==========================================
// 7. ENDPOINT ADMIN: UPDATE DATA USER LAIN
// ==========================================
func (h *AuthHandler) UpdateUserByAdmin(c *gin.Context) {
	// Ambil ID user target dari URL (contoh: /admin/users/123-abc)
	targetID := c.Param("id")

	// Tangkap data dari Frontend (semuanya opsional)
	var input struct {
		FullName string `json:"full_name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
		return
	}

	// Cari user yang ingin diedit di database
	var user repository.User
	if err := h.DB.First(&user, "id = ?", targetID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}

	// Cek satu per satu, jika datanya dikirim, maka timpa data lamanya
	if input.FullName != "" {
		user.FullName = input.FullName
	}
	if input.Email != "" {
		user.Email = input.Email
	}
	if input.Role != "" {
		user.Role = input.Role
	}
	// Jika ada input password baru, hash terlebih dahulu sebelum disimpan
	if input.Password != "" {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		user.Password = string(hashedPassword)
	}

	// Simpan perubahan ke database
	if err := h.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui pengguna"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Data pengguna berhasil diperbarui",
	})
}
