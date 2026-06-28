package repository

import (
	"time"
	"gorm.io/gorm"
)

type FinanceCategory struct {
	ID        string `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
	Name      string `gorm:"type:varchar(100);not null" json:"name"`
	Budget    int    `gorm:"type:int;default:0" json:"budget"`
	Icon      string `gorm:"type:varchar(100);default:'MoreHorizontal'" json:"icon"`
	ColorBg   string `gorm:"type:varchar(20);default:'#F3F4F6'" json:"colorBg"`
	ColorIcon string `gorm:"type:varchar(20);default:'#374151'" json:"colorIcon"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type FinanceTransaction struct {
	ID          string `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
	Date        string `gorm:"type:varchar(50);not null" json:"date"`
	Description string `gorm:"type:varchar(255)" json:"description"`
	Category    string `gorm:"type:varchar(100);not null" json:"category"`
	Amount      int    `gorm:"type:int;not null" json:"amount"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type FinanceMonthlyBudget struct {
	ID        string `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
	MonthYear string `gorm:"type:varchar(50);not null;unique" json:"monthYear"`
	Amount    int    `gorm:"type:int;default:0" json:"amount"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type FinanceMonthlyCategoryBudget struct {
	ID         string `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
	MonthYear  string `gorm:"type:varchar(50);not null;uniqueIndex:idx_month_category" json:"monthYear"`
	CategoryID string `gorm:"type:uuid;not null;uniqueIndex:idx_month_category" json:"categoryId"`
	Amount     int    `gorm:"type:int;default:0" json:"amount"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}
