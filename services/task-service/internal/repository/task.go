package repository

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID          string `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
	Title       string `gorm:"type:varchar(255);not null" json:"title"`
	Description string `gorm:"type:text" json:"description"`

	// Status Kanban: To Do, In Progress, Done
	Status string `gorm:"type:varchar(50);default:'To Do'" json:"status"`

	// Relasi antar microservices (Tanpa Foreign Key constraint di DB lokal)
	ProjectID string `gorm:"type:uuid;not null;index" json:"project_id"`

	// Menggunakan Pointer (*string) agar nilainya bisa NULL
	AssigneeID *string `gorm:"type:uuid;index" json:"assignee_id"`

	// ==========================================
	// FIELD BARU HASIL UPDATE UI
	// ==========================================
	Label          *string `gorm:"type:varchar(50)" json:"label"`
	StartDate      *string `gorm:"type:date" json:"start_date"`
	EndDate        *string `gorm:"type:date" json:"end_date"`
	Attachment     *string `gorm:"type:text" json:"attachment"`
	AttachmentName *string `gorm:"type:varchar(255)" json:"attachment_name"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
