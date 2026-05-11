package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

// reverseProxy adalah fungsi helper untuk meneruskan request ke microservice target
func reverseProxy(target string) gin.HandlerFunc {
	return func(c *gin.Context) {
		url, err := url.Parse(target)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Target URL tidak valid"})
			return
		}

		proxy := httputil.NewSingleHostReverseProxy(url)

		// Modifikasi request agar sesuai dengan target
		c.Request.URL.Host = url.Host
		c.Request.URL.Scheme = url.Scheme
		c.Request.Header.Set("X-Forwarded-Host", c.Request.Header.Get("Host"))
		c.Request.Host = url.Host

		// Teruskan request
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

func main() {
	log.Println("Memulai Aksara API Gateway...")

	r := gin.Default()

	// Middleware CORS dasar (Penting agar React bisa mengaksesnya nanti)
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
	// ROUTING KE MICROSERVICES TARGET
	// ==========================================

	// 1. Target URL untuk User Service (Port 8081)
	userServiceURL := "http://localhost:8081"

	// 2. Rute Publik (Tidak butuh token)
	r.POST("/register", reverseProxy(userServiceURL))
	r.POST("/login", reverseProxy(userServiceURL))

	// Jalankan API Gateway di Port 8000
	log.Println("✅ API Gateway berjalan di port 8000...")
	r.Run(":8000")
}
