<script setup lang="ts">
import Button from "@/components/ui/Button.vue";
import { HANGMAN_THEMES } from "@/constants/Global";
import { computed, ref } from "vue";

const selectedThemes = ref<string[]>([]);

// Состояние "Выбрать все"
const selectAll = computed({
  get: () => selectedThemes.value.length === HANGMAN_THEMES.length,
  set: (value: boolean) => {
    if (value) {
      selectedThemes.value = HANGMAN_THEMES.map(t => t.value);
    } else {
      selectedThemes.value = [];
    }
  }
});

// Функция для ручного переключения "Выбрать все"
const toggleAll = () => {
  if (selectedThemes.value.length === HANGMAN_THEMES.length) {
    selectedThemes.value = [];
  } else {
    selectedThemes.value = HANGMAN_THEMES.map(t => t.value);
  }
};

const getThemeText = (value: string) => {
  const theme = HANGMAN_THEMES.find(t => t.value === value);
  return theme?.text || value;
};

const removeTheme = (themeValue: string) => {
  selectedThemes.value = selectedThemes.value.filter(v => v !== themeValue);
};

// Для отладки - посмотрим, что выбрано
const logSelected = () => {
  console.log('Выбрано тем:', selectedThemes.value);
};
</script>

<template>
  <div id="hangman-theme-select-screen" class="screen" style="display: block;">
    <div class="container">
      <h1 class="h1 _text-center">Выберите тему</h1>

      <div class="themes-grid">
        <!-- Чекбокс "Выбрать все" - убираем @change, оставляем только v-model -->
        <label class="theme-checkbox theme-checkbox--all">
          <input
              type="checkbox"
              v-model="selectAll"
          />
          <span class="checkbox-custom"></span>
          <span class="theme-text">Выбрать все</span>
        </label>

        <!-- Чекбоксы для каждой темы -->
        <label
            v-for="theme in HANGMAN_THEMES"
            :key="theme.value"
            class="theme-checkbox"
        >
          <input
              type="checkbox"
              v-model="selectedThemes"
              :value="theme.value"
          />
          <span class="checkbox-custom"></span>
          <span class="theme-text">{{ theme.text }}</span>
        </label>
      </div>

      <Button class="btn" @click="logSelected">Начать</Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.screen {
  align-content: center;
  height: 100%;
}

.screen .container {
  height: 70svh;
  display: flex;
  align-items: center;
  justify-content: start;
  flex-direction: column;
  gap: 3rem;
}

.hangman-theme-select-page {
  height: 100%;
}

.btn {
  font-size: 30px;
}

.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.theme-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  input {
    display: none;
  }

  .checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid #4CAF50;
    border-radius: 4px;
    position: relative;
    transition: all 0.2s ease;
  }

  input:checked + .checkbox-custom {
    background: #4CAF50;

    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
    }
  }

  .theme-text {
    font-size: 16px;
    user-select: none;
  }

  &--all {
    background: rgba(76, 175, 80, 0.2);
    border: 1px solid #4CAF50;

    .checkbox-custom {
      border-color: #FFC107;
    }

    input:checked + .checkbox-custom {
      background: #FFC107;
    }
  }
}
</style>