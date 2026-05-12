package repository

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	// Menggunakan UUID agar aman untuk microservices
	ID          string `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
	Name        string `gorm:"type:varchar(255);not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`

	// OwnerID akan menyimpan user_id dari JWT, tapi TIDAK ada Foreign Key
	// secara langsung ke tabel users karena beda service (Loose Coupling)
	OwnerID string `gorm:"type:uuid;not null" json:"owner_id"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
