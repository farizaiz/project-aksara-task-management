package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"aksara/comment-service/internal/repository"

	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go" // Import library amqp
	"gorm.io/gorm"
)

type CommentHandler struct {
	DB         *gorm.DB
	RabbitConn *amqp.Connection // Tambahkan field RabbitConn
}

func (h *CommentHandler) CreateComment(c *gin.Context) {
	var input struct {
		TaskID  string `json:"task_id" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetHeader("X-User-Id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak terautentikasi"})
		return
	}

	comment := repository.Comment{
		TaskID:  input.TaskID,
		UserID:  userID,
		Content: input.Content,
	}

	if err := h.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan komentar"})
		return
	}

	// ==========================================
	// PUBLISH EVENT KE RABBITMQ
	// ==========================================
	if h.RabbitConn != nil {
		ch, err := h.RabbitConn.Channel()
		if err == nil {
			defer ch.Close()

			// Siapkan data event untuk dikirim
			eventData, _ := json.Marshal(map[string]interface{}{
				"comment_id": comment.ID,
				"task_id":    comment.TaskID,
				"user_id":    comment.UserID,
				"content":    comment.Content,
				"created_at": comment.CreatedAt,
			})

			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			// Kirim pesan ke antrean comment_created_queue
			ch.PublishWithContext(ctx,
				"",                      // exchange
				"comment_created_queue", // routing key
				false,
				false,
				amqp.Publishing{
					ContentType: "application/json",
					Body:        eventData,
				})
		}
	}
	// ==========================================

	c.JSON(http.StatusCreated, gin.H{
		"message": "Komentar berhasil ditambahkan!",
		"data":    comment,
	})
}
