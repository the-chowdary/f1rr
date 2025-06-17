package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/the-chowdary/f1rr/internal/api/handlers"
)

func main() {
	fmt.Println("f1rr....")
	http.HandleFunc("/f1calendar", handlers.F1CalendarHandler)
	log.Println("server started at port: 8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
