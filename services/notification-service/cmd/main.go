package main

import (
	"log"
	"os"

	"aksara/pkg/broker"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: File .env tidak ditemukan")
	}

	rabbitURL := os.Getenv("RABBITMQ_URL")
	conn, err := broker.ConnectRabbitMQ(rabbitURL)
	if err != nil {
		log.Fatalf("Gagal terhubung ke broker: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Gagal membuka channel: %v", err)
	}
	defer ch.Close()

	// 1. Setup Consumer untuk Task (Antrean: task_created_queue)
	go func() {
		q, _ := ch.QueueDeclare("task_created_queue", true, false, false, false, nil)
		msgs, _ := ch.Consume(q.Name, "", true, false, false, false, nil)
		for d := range msgs {
			log.Printf("📩 [TASK EVENT] Menerima event baru: %s", d.Body)
			log.Println("🚀 Simulasi: Mengirim notifikasi email tugas ke user...")
		}
	}()

	// 2. Setup Consumer untuk Comment (Antrean: comment_created_queue)
	go func() {
		q, _ := ch.QueueDeclare("comment_created_queue", true, false, false, false, nil)
		msgs, _ := ch.Consume(q.Name, "", true, false, false, false, nil)
		for d := range msgs {
			log.Printf("📩 [COMMENT EVENT] Menerima komentar baru: %s", d.Body)
			log.Println("🚀 Simulasi: Mengirim notifikasi komentar ke pemilik tugas...")
		}
	}()

	log.Println("✅ Aksara Notification Service berjalan (Memantau TASK & COMMENT queue)...")

	// Menahan agar program tidak berhenti
	forever := make(chan bool)
	<-forever
}
