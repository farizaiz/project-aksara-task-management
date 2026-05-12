package broker

import (
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Menyiapkan RabbitMQ Connection
func ConnectRabbitMQ(url string) (*amqp.Connection, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		log.Printf("Gagal terhubung dengan RabbitMQ: %v", err)
		return nil, err
	}
	log.Println("✅ Terhubung dengan RabbitMQ")
	return conn, nil
}
