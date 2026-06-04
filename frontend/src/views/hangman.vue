<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { ruKeys } from "@/constants/Global";
import { useRoute, useRouter } from "vue-router";
import { hangmanApi } from "@/services/api/hangman-api";

const route = useRoute();
const router = useRouter();

const hangmanParts = [
  "platform", "part1", "part2", "part3", "head", "body", "handLeft", "handRight", "legLeft", "legRight"
];

const MAX_MISTAKES = hangmanParts.length;

const themesParam = route.query.themes as string || '';
const selectedThemes = themesParam ? themesParam.split(',') : [];

const intendedWord = ref({ text: "", theme: "" });
const isWinner = ref(false);
const isLoser = ref(false);
const currentMistakes = ref(0);
const guessedLetters = ref<Set<string>>(new Set());
const wrongLetters = ref<Set<string>>(new Set());
const loading = ref(true);
const error = ref('');

const wordLetters = computed(() => intendedWord.value.text.split(""));
const displayWord = computed(() => {
  if (!intendedWord.value.text) return [];
  return wordLetters.value.map(letter => guessedLetters.value.has(letter) ? letter : "_");
});

const isWordGuessed = computed(() => {
  if (!intendedWord.value.text) return false;
  return wordLetters.value.every(letter => guessedLetters.value.has(letter));
});

const showHangmanPart = (index: number) => {
  const element = document.getElementById(hangmanParts[index]);
  if (element) element.classList.add("visible");
};

const hideAllHangmanParts = () => {
  hangmanParts.forEach(partId => {
    const element = document.getElementById(partId);
    if (element) element.classList.remove("visible");
  });
};

const updateHangmanByMistakes = () => {
  for (let i = 0; i < currentMistakes.value && i < hangmanParts.length; i++) {
    showHangmanPart(i);
  }
};

const loadWordFromBackend = async () => {
  if (selectedThemes.length === 0) {
    error.value = 'Темы не выбраны. Вернитесь и выберите темы.';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const data = await hangmanApi.getRandomWord(selectedThemes);
    intendedWord.value.text = data.word;
    intendedWord.value.theme = data.theme;
  } catch (err) {
    console.error('Ошибка загрузки слова:', err);
    error.value = 'Не удалось загрузить слово. Проверьте соединение с сервером.';
  } finally {
    loading.value = false;
  }
};

const resetGame = () => {
  isWinner.value = false;
  isLoser.value = false;
  currentMistakes.value = 0;
  guessedLetters.value.clear();
  wrongLetters.value.clear();
  hideAllHangmanParts();
  loadWordFromBackend();
};

const handleLetter = (letter: string) => {
  if (isWinner.value || isLoser.value || loading.value) return;
  const upperLetter = letter.toUpperCase();

  if (guessedLetters.value.has(upperLetter) || wrongLetters.value.has(upperLetter)) return;

  if (wordLetters.value.includes(upperLetter)) {
    guessedLetters.value.add(upperLetter);
    if (isWordGuessed.value) isWinner.value = true;
  } else {
    wrongLetters.value.add(upperLetter);
    currentMistakes.value++;
    updateHangmanByMistakes();
    if (currentMistakes.value >= MAX_MISTAKES) isLoser.value = true;
  }
};

const onLetterClick = (letter: string) => handleLetter(letter);

const onKeyPress = (event: KeyboardEvent) => {
  const key = event.key.toUpperCase();
  if (/^[А-ЯЁ]$/i.test(key)) handleLetter(key);
};

const playAgain = () => resetGame();
const goBackToThemes = () => router.push({ name: 'select-themes' });

onMounted(() => {
  if (selectedThemes.length === 0) {
    error.value = 'Темы не выбраны. Пожалуйста, вернитесь и выберите темы.';
    loading.value = false;
  } else {
    loadWordFromBackend();
  }
  window.addEventListener("keydown", onKeyPress);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyPress);
});

watch(() => intendedWord.value.text, () => updateHangmanByMistakes());
</script>

<template>
  <div id="game-screen" class="screen">
    <div class="container">
      <!-- Кнопка назад -->
      <button class="back-btn" @click="goBackToThemes">← Назад к темам</button>

      <!-- Ошибка -->
      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="goBackToThemes">Выбрать темы</button>
      </div>

      <!-- Загрузка -->
      <div v-else-if="loading" class="loading-message">
        Загрузка слова...
      </div>

      <!-- Игра -->
      <template v-else>
        <div class="word-theme" v-if="intendedWord.theme">
          Тема: {{ intendedWord.theme }}
        </div>

        <!-- Виселица -->
        <div id="hangman">
          <div id="platform"></div>
          <div id="part1"></div>
          <div id="part2"></div>
          <div id="part3"></div>
          <div id="corpse">
            <div id="head"></div>
            <div id="body"></div>
            <div id="handLeft"></div>
            <div id="handRight"></div>
            <div id="legLeft"></div>
            <div id="legRight"></div>
          </div>
        </div>

        <!-- Отображение слова -->
        <div class="word">
          <div
              v-for="(letter, idx) in displayWord"
              :key="idx"
              class="word__letter"
              :data-state="letter !== '_' ? 'filled' : 'empty'"
          >
            {{ letter }}
          </div>
        </div>

        <!-- Клавиатура -->
        <div class="keys">
          <div
              v-for="letter in ruKeys"
              :key="letter"
              class="letter-card"
              :class="{
              'disabled': guessedLetters.has(letter.toUpperCase()) || wrongLetters.has(letter.toUpperCase()),
              'correct': guessedLetters.has(letter.toUpperCase()),
              'wrong': wrongLetters.has(letter.toUpperCase())
            }"
              @click="onLetterClick(letter)"
          >
            {{ letter }}
          </div>
        </div>

        <!-- Счетчик ошибок -->
        <div class="mistakes-counter">
          Ошибок: {{ currentMistakes }} / {{ MAX_MISTAKES }}
        </div>
      </template>

      <!-- Окно победы -->
      <div class="winning" v-if="isWinner">
        <div class="winning__title">
          <span class="fire">🔥</span>
          <span class="winning__title-text">Вы выиграли!</span>
          <span class="fire">🔥</span>
        </div>
        <div class="button js-play" @click="playAgain">Еще раз?</div>
        <div class="button secondary" @click="goBackToThemes">Выбрать другие темы</div>
      </div>

      <!-- Окно поражения -->
      <div class="losing" v-if="isLoser">
        <div class="losing__title">
          Вы проиграли!
          <div class="losing__word">Загаданное слово: {{ intendedWord.text }}</div>
        </div>
        <div class="button js-play" @click="playAgain">Еще раз?</div>
        <div class="button secondary" @click="goBackToThemes">Выбрать другие темы</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  flex-direction: column;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #d6b575;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  color: #2f241b;
  transition: 0.1s;

  &:hover {
    background: #c4a060;
  }
}

.error-message, .loading-message {
  text-align: center;
  font-size: 1.2rem;
  background: #2d241c;
  padding: 20px 40px;
  border-radius: 20px;
  color: #ffdfa5;

  button {
    margin-top: 15px;
    background: #e7b874;
    border: none;
    padding: 8px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
  }
}

.button.secondary {
  background: #8a7a62;
  box-shadow: 0 5px 0 #5a4a38;
  margin-top: 10px;

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #5a4a38;
  }
}

// Остальные стили из твоего компонента
#hangman {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto 20px;
  background: #f5e7d3;
  border-radius: 28px;
  box-shadow: inset 0 0 0 3px #ecd9b9, 0 8px 18px rgba(0, 0, 0, 0.2);
}

#platform, #part1, #part2, #part3,
#head, #body, #handLeft, #handRight, #legLeft, #legRight {
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  position: absolute;
}

.visible {
  opacity: 1 !important;
}

#platform {
  bottom: 25px;
  left: 45px;
  width: 180px;
  height: 16px;
  background: #6b3e1c;
  border-radius: 20px;
  box-shadow: 0 5px 0 #3e2a1a, inset 0 1px 3px #c98a4a;
  z-index: 2;
}

#part1 {
  bottom: 25px;
  left: 65px;
  width: 14px;
  height: 210px;
  background: #7a4c2c;
  border-radius: 20px;
  box-shadow: 2px 2px 0px #4a2e18;
  z-index: 1;
}

#part2 {
  bottom: 187px;
  left: 65px;
  width: 100px;
  height: 14px;
  background: #8b5a3a;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

#part3 {
  bottom: 187px;
  left: 145px;
  width: 12px;
  height: 55px;
  background: #6b3e1c;
  border-radius: 20px;
}

#corpse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

#head {
  top: 58px;
  left: 130px;
  width: 42px;
  height: 42px;
  background: #fdd7a8;
  border-radius: 50%;
  box-shadow: inset -3px -2px 0px #c28a5e, 0 4px 8px rgba(0,0,0,0.2);
  border: 2px solid #a5662e;
}

#body {
  top: 101px;
  left: 149px;
  width: 4px;
  height: 68px;
  background: #4a2a1a;
  border-radius: 8px;
  box-shadow: 0 0 0 2px #f0cf9c;
}

#handLeft {
  top: 108px;
  left: 124px;
  width: 28px;
  height: 5px;
  background: #4a2a1a;
  border-radius: 10px;
  transform-origin: right center;
  transform: rotate(-35deg);
  box-shadow: 0 0 0 1px #e7bc82;
}

#handRight {
  top: 108px;
  left: 150px;
  width: 28px;
  height: 5px;
  background: #4a2a1a;
  border-radius: 10px;
  transform-origin: left center;
  transform: rotate(35deg);
  box-shadow: 0 0 0 1px #e7bc82;
}

#legLeft {
  top: 165px;
  left: 128px;
  width: 25px;
  height: 5px;
  background: #4a2a1a;
  border-radius: 10px;
  transform-origin: right center;
  transform: rotate(-25deg);
}

#legRight {
  top: 165px;
  left: 149px;
  width: 25px;
  height: 5px;
  background: #4a2a1a;
  border-radius: 10px;
  transform-origin: left center;
  transform: rotate(25deg);
}

.word {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 25px 0;

  &__letter {
    font-size: 2.2rem;
    font-weight: bold;
    font-family: monospace;
    background: #2a241e;
    display: inline-block;
    width: 40px;
    text-align: center;
    padding: 12px 0;
    border-radius: 16px;
    color: #f7e3af;
    text-transform: uppercase;
    letter-spacing: 2px;
    box-shadow: inset 0 -2px 0 #5a4a38, 0 4px 8px rgba(0,0,0,0.2);

    &[data-state="empty"] {
      color: #d4b483;
      background: #3e3328;
    }

    &[data-state="filled"] {
      background: #2c5a2a;
      color: #ffefb9;
      box-shadow: inset 0 -2px 0 #1f4a1a;
    }
  }
}

.word-theme {
  text-align: center;
  font-size: 0.9rem;
  background: #d6b57580;
  display: inline-block;
  padding: 4px 20px;
  border-radius: 50px;
  margin-bottom: 12px;
  color: #2f241b;
  font-weight: bold;
  backdrop-filter: blur(4px);
}

.keys {
  display: grid;
  grid-gap: 12px;
  grid-template-columns: repeat(11, 1fr);
  max-width: 700px;
  margin: 20px auto;

  .letter-card {
    font-size: 1.7rem;
    font-weight: bold;
    text-align: center;
    padding: 12px 0;
    background: #f0dbc0;
    border-radius: 40px;
    cursor: pointer;
    transition: 0.1s linear;
    box-shadow: 0 5px 0 #9b7e62;
    text-transform: uppercase;
    font-family: monospace;
    min-width: 40px;
    color: #000;
    text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;

    &:active {
      transform: translateY(2px);
      box-shadow: 0 2px 0 #9b7e62;
    }

    &.disabled {
      opacity: 0.5;
      transform: translateY(0);
      cursor: not-allowed;
      filter: grayscale(0.2);
      box-shadow: 0 5px 0 #9b7e62;
    }

    &.correct {
      background: #5b8c50;
      color: white;
      box-shadow: 0 5px 0 #2a5530;
    }

    &.wrong {
      background: #b15a4a;
      color: #ffe0c4;
      box-shadow: 0 5px 0 #73382a;
    }
  }
}

.mistakes-counter {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  background: #2a211a;
  display: inline-block;
  width: auto;
  margin: 0 auto;
  padding: 6px 24px;
  border-radius: 50px;
  color: #ffdfa5;
}

.winning, .losing {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #2d241cee;
  backdrop-filter: blur(12px);
  padding: 32px 48px;
  border-radius: 64px;
  text-align: center;
  z-index: 100;
  border: 2px solid #ffdfaa;
  box-shadow: 0 20px 35px rgba(0,0,0,0.5);

  &__title {
    display: flex;
    gap: 20px;
    align-items: center;
    font-size: 2rem;
    font-weight: bold;
    color: #ffeaac;
    margin-bottom: 25px;

    .fire {
      font-size: 2.2rem;
    }
  }

  &__title-text {
    text-shadow: 0 2px 0 #7a4a1a;
  }

  .button {
    background: #e7b874;
    border: none;
    font-size: 1.4rem;
    padding: 12px 28px;
    border-radius: 60px;
    cursor: pointer;
    font-weight: bold;
    transition: 0.1s;
    box-shadow: 0 5px 0 #8a623f;
    margin-top: 10px;

    &:active {
      transform: translateY(2px);
      box-shadow: 0 2px 0 #8a623f;
    }
  }
}

.losing__word {
  font-size: 1.3rem;
  color: #ffc285;
  background: #00000066;
  padding: 5px 15px;
  border-radius: 50px;
}

@media (max-width: 600px) {
  .keys {
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;

    .letter-card {
      font-size: 1.2rem;
      padding: 8px 0;
    }
  }

  .word__letter {
    width: 40px;
    font-size: 1.5rem;
    padding: 8px 0;
  }

  #hangman {
    transform: scale(0.85);
  }
}
</style>