package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Config menyimpan kredensial database.
// Menggunakan struct memudahkan tiap microservice mengirimkan konfigurasi yang berbeda
// (misalnya jika nanti Anda memisahkan database per service).
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// ConnectDB adalah fungsi yang akan dipanggil oleh setiap microservice
// untuk mendapatkan instance dari *gorm.DB.
func ConnectDB(cfg Config) (*gorm.DB, error) {
	// Menyusun Data Source Name (DSN) untuk PostgreSQL
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		cfg.Host, cfg.User, cfg.Password, cfg.DBName, cfg.Port, cfg.SSLMode)

	// Membuka koneksi menggunakan GORM
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		// Mengatur level logger GORM untuk memudahkan debugging saat development
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Printf("❌ Gagal terhubung ke database %s: %v\n", cfg.DBName, err)
		return nil, err
	}

	log.Printf("✅ Berhasil terhubung ke database %s di %s:%s\n", cfg.DBName, cfg.Host, cfg.Port)

	return db, nil
}
