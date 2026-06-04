package handlers

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"strings"

	"github.com/crackeroon/hangman/data"
	"github.com/crackeroon/hangman/models"
)

type WordResponse struct {
	Word  models.Word `json:"word"`
	Total int         `json:"total"`
}

// GetRandomWordByThemes - возвращает случайное слово по выбранным темам
func GetRandomWordByThemes(w http.ResponseWriter, r *http.Request) {
	// Получаем параметр themes из query (например ?themes=transport,food)
	themesParam := r.URL.Query().Get("themes")

	var filteredWords []models.Word

	if themesParam == "" {
		// Если темы не выбраны - возвращаем все слова
		filteredWords = data.Dictionary
	} else {
		themes := strings.Split(themesParam, ",")
		themeMap := make(map[string]bool)
		for _, theme := range themes {
			themeMap[theme] = true
		}

		// Фильтруем слова по темам
		for _, word := range data.Dictionary {
			if themeMap[word.Theme] {
				filteredWords = append(filteredWords, word)
			}
		}
	}

	if len(filteredWords) == 0 {
		http.Error(w, "No words found for selected themes", http.StatusNotFound)
		return
	}

	// Выбираем случайное слово
	randomIndex := rand.Intn(len(filteredWords))
	randomWord := filteredWords[randomIndex]

	response := WordResponse{
		Word:  randomWord,
		Total: len(filteredWords),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetAllThemes - возвращает список всех доступных тем
func GetAllThemes(w http.ResponseWriter, r *http.Request) {
	themeMap := make(map[string]bool)
	for _, word := range data.Dictionary {
		themeMap[word.Theme] = true
	}

	themes := make([]string, 0, len(themeMap))
	for theme := range themeMap {
		themes = append(themes, theme)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(themes)
}

// GetWordsByTheme - возвращает все слова по указанной теме
func GetWordsByTheme(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, "No words found for this theme", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(words)
}

// HealthCheck - проверка работоспособности
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "ok",
		"message": "Hangman API is running",
	})
}
