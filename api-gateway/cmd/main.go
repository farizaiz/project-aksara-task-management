package main

import (
	"log"
	"net/http/httputil"
	"net/url"

	"aksara/pkg/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func reverseProxy(target string) gin.HandlerFunc {
	return func(c *gin.Context) {
		url, _ := url.Parse(target)
		proxy := httputil.NewSingleHostReverseProxy(url)

		c.Request.URL.Host = url.Host
		c.Request.URL.Scheme = url.Scheme
		c.Request.Header.Set("X-Forwarded-Host", c.Request.Header.Get("Host"))

		if userID, exists := c.Get("user_id"); exists {
			c.Request.Header.Set("X-User-Id", userID.(string))
		}

		c.Request.Host = url.Host
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: File .env tidak ditemukan di api-gateway")
	}

	log.Println("Memulai Aksara API Gateway...")
	r := gin.Default()

	// Middleware CORS Dasar
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// ==========================================
	// TARGET URL MICROSERVICES
	// ==========================================
	userServiceURL := "http://localhost:8081"
	projectServiceURL := "http://localhost:8082"
	taskServiceURL := "http://localhost:8083"
	commentServiceURL := "http://localhost:8084" // Tambahkan target Comment Service

	// ==========================================
	// RUTE PUBLIK (Tanpa Token)
	// ==========================================
	public := r.Group("/")
	{
		public.POST("/register", reverseProxy(userServiceURL))
		public.POST("/login", reverseProxy(userServiceURL))
	}

	// ==========================================
	// RUTE PRIVAT (Wajib Token JWT)
	// ==========================================
	protected := r.Group("/")
	protected.Use(middleware.RequireAuth())
	{
		protected.POST("/projects", reverseProxy(projectServiceURL))

		// Rute untuk membuat tugas (POST)
		protected.POST("/tasks", reverseProxy(taskServiceURL))
		// Rute untuk mengambil daftar tugas (GET)
		protected.GET("/tasks", reverseProxy(taskServiceURL))
		// Rute untuk update status tugas (PUT)
		protected.PUT("/tasks/:id", reverseProxy(taskServiceURL))

		// Rute Comment Service
		protected.POST("/comments", reverseProxy(commentServiceURL))

		// --- TAMBAHKAN BARIS INI ---
		// Rute untuk mengambil profil user yang sedang login
		protected.GET("/users/me", reverseProxy(userServiceURL))
		protected.PUT("/users/me", reverseProxy(userServiceURL))
	}

	log.Println("✅ API Gateway berjalan di port 8000...")
	r.Run(":8000")
}
