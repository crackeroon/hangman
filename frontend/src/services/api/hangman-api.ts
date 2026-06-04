// Получаем базовый URL из переменных окружения
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
import * as forge from 'node-forge'

const SECRET_KEY = "01234567890123456789012345678901"

interface Word {
    text: string
    theme: string
}

interface EncryptedWordResponse {
    word: string      // зашифрованная строка
    theme: string
    total: number
}

export const hangmanApi = {
    // Проверка здоровья сервера
    async healthCheck(): Promise<{ status: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/health`)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.json()
        } catch (error) {
            console.error('Health check failed:', error)
            throw error
        }
    },

    // Получить случайное слово по выбранным темам
    async getRandomWord(themes: string[]): Promise<{ word: string, theme: string, total: number }> {
        const response = await fetch(`${API_BASE_URL}/word?themes=${themes.join(',')}`)

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const data: EncryptedWordResponse = await response.json()

        console.log('Зашифрованное слово (base64):', data.word)

        // Расшифровка для AES-GCM с помощью node-forge
        let decryptedWord = ''
        try {
            // Декодируем base64 в бинарные данные
            const encryptedBytes = forge.util.decode64(data.word)

            // Для Go GCM: nonce (12 байт) + ciphertext + tag (16 байт)
            const nonceLength = 12
            const tagLength = 16

            // Разделяем: nonce (первые 12 байт), ciphertext+tag (остальное)
            const nonce = encryptedBytes.substring(0, nonceLength)
            const encryptedWithTag = encryptedBytes.substring(nonceLength)

            // Последние 16 байт - это тег
            const tag = encryptedWithTag.substring(encryptedWithTag.length - tagLength)
            const ciphertext = encryptedWithTag.substring(0, encryptedWithTag.length - tagLength)

            // Создаем ключ
            const key = forge.util.createBuffer(SECRET_KEY)

            // Создаем decipher для AES-GCM
            const decipher = forge.cipher.createDecipher('AES-GCM', key)

            // Настройка с iv и тегом
            decipher.start({
                iv: nonce,
                tag: forge.util.createBuffer(tag),
                tagLength: tagLength * 8  // 128 бит
            })

            // Добавляем зашифрованные данные
            decipher.update(forge.util.createBuffer(ciphertext))

            // Завершаем расшифровку
            const success = decipher.finish()

            if (success) {
                decryptedWord = decipher.output.toString()
                console.log('Расшифрованное слово:', decryptedWord)
            } else {
                throw new Error('Decryption failed - tag mismatch')
            }
        } catch (error) {
            console.error('Ошибка расшифровки:', error)
            // Если расшифровка не удалась, возможно слово не зашифровано
            decryptedWord = data.word
        }

        return {
            word: decryptedWord,
            theme: data.theme,
            total: data.total
        }
    },

    // Получить все доступные темы
    async getAllThemes(): Promise<string[]> {
        const response = await fetch(`${API_BASE_URL}/themes`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
    },

    // Получить все слова по определённой теме
    async getWordsByTheme(theme: string): Promise<Word[]> {
        if (!theme) throw new Error('Theme is required')

        const response = await fetch(`${API_BASE_URL}/words?theme=${theme}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
    }
}

// Экспортируем URL для отладки (опционально)
export { API_BASE_URL }