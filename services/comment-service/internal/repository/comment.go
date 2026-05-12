package repository

import (
	"time"

	"gorm.io/gorm"
)

type Comment struct {
	ID      string `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
	TaskID  string `gorm:"type:uuid;not null;index" json:"task_id"` // Tugas mana yang dikomentari
	UserID  string `gorm:"type:uuid;not null;index" json:"user_id"` // Siapa yang berkomentar
	Content string `gorm:"type:text;not null" json:"content"`       // Isi komentar

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
