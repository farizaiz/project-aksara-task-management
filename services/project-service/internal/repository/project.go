package repository

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	// Menggunakan UUID agar aman untuk microservices
	ID          string `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
	Name        string `gorm:"type:varchar(255);not null" json:"name"` // Di UI React, ini akan menjadi 'title'
	Description string `gorm:"type:text" json:"description"`

	// OwnerID akan menyimpan user_id dari JWT (Loose Coupling)
	OwnerID string `gorm:"type:uuid;not null" json:"owner_id"`

	// ==========================================
	// TAMBAHAN UNTUK MENDUKUNG UI REACT KITA
	// ==========================================
	Meta      string `gorm:"type:varchar(100)" json:"meta"` // Contoh: "Personal", "Shared"
	BgColor   string `gorm:"type:varchar(20);default:'#F4F4F5'" json:"bg_color"`
	IconColor string `gorm:"type:varchar(20);default:'#71717A'" json:"icon_color"`

	// Menyimpan data kolom Kanban (To Do, Ideation, dll) dalam format JSON yang fleksibel
	Columns string `gorm:"type:jsonb;default:'[]'" json:"columns"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
