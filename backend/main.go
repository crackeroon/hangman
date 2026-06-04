package main

import (
	"crypto/aes"
	"crypto/cipher"
	cryptorand "crypto/rand"
	"encoding/base64"
	"encoding/json"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/crackeroon/hangman/data"
	"github.com/crackeroon/hangman/models"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type WordResponse struct {
	Word  string `json:"word"` // Зашифрованное слово
	Theme string `json:"theme"`
	Total int    `json:"total"`
}

// Ключ для шифрования (32 байта для AES-256)
var encryptionKey = []byte("01234567890123456789012345678901")

// Функция шифрования
func encrypt(plaintext string) (string, error) {
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(cryptorand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Обработчик /api/health
func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// Обработчик /api/word - возвращает зашифрованное слово
func getRandomWordByThemes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method == "OPTIONS" {
		return
	}

	themesParam := r.URL.Query().Get("themes")

	var filtered []models.Word

	if themesParam == "" {
		filtered = data.Dictionary
	} else {
		themes := strings.Split(themesParam, ",")
		themeMap := make(map[string]bool)
		for _, t := range themes {
			themeMap[t] = true
		}

		for _, word := range data.Dictionary {
			if themeMap[word.Theme] {
				filtered = append(filtered, word)
			}
		}
	}

	if len(filtered) == 0 {
		http.Error(w, "No words found", http.StatusNotFound)
		return
	}

	randomWord := filtered[rand.Intn(len(filtered))]

	// Шифруем слово
	encryptedWord, err := encrypt(randomWord.Text)
	if err != nil {
		http.Error(w, "Encryption error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(WordResponse{
		Word:  encryptedWord,
		Theme: randomWord.Theme,
		Total: len(filtered),
	})
}

// Обработчик /api/themes
func getAllThemes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method == "OPTIONS" {
		return
	}

	themeMap := make(map[string]bool)
	for _, word := range data.Dictionary {
		themeMap[word.Theme] = true
	}

	themes := make([]string, 0, len(themeMap))
	for t := range themeMap {
		themes = append(themes, t)
	}

	json.NewEncoder(w).Encode(themes)
}

// Обработчик /api/words
func getWordsByTheme(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method == "OPTIONS" {
		return
	}

	theme := r.URL.Query().Get("theme")
	if theme == "" {
		http.Error(w, "Theme parameter is required", http.StatusBadRequest)
		return
	}

	var words []models.Word
	for _, word := range data.Dictionary {
		if word.Theme == theme {
			words = append(words, word)
		}
	}

	if len(words) == 0 {
		http.Error(w, "No words found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(words)
}

func main() {
	// Инициализируем генератор случайных чисел (новый способ)
	rand.NewSource(time.Now().UnixNano())

	// Получаем порт из переменных окружения
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Создаем роутер
	r := mux.NewRouter()

	// API endpoints
	r.HandleFunc("/api/health", healthCheck).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/word", getRandomWordByThemes).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/themes", getAllThemes).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/words", getWordsByTheme).Methods("GET", "OPTIONS")

	// Настройка CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost", "http://localhost:80", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	// Запускаем сервер
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, handler))
}
