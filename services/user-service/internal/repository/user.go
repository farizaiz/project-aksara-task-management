package repository

import (
	"time"

	"gorm.io/gorm"
)

// User merepresentasikan tabel users di database.
type User struct {
	ID        string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	FullName  string         `gorm:"type:varchar(100);not null" json:"full_name"`
	Email     string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"type:varchar(255);not null" json:"-"`         // json:"-" agar password tidak pernah bocor ke response
	Role      string         `gorm:"type:varchar(20);default:'user'" json:"role"` // <--- TAMBAHKAN BARIS INI
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"` // Soft delete standar GORM
}
