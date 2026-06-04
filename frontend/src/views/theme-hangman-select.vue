<script setup lang="ts">
import Button from "@/components/ui/Button.vue";
import { HANGMAN_THEMES } from "@/constants/Global";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const selectedThemes = ref<string[]>([]);
const showWarning = ref(false);
let warningTimer: ReturnType<typeof setTimeout> | null = null; // Храним ссылку на таймер

// Состояние "Выбрать все"
const selectAll = computed({
  get: () => selectedThemes.value.length === HANGMAN_THEMES.length,
  set: (value: boolean) => {
    if (value) {
      selectedThemes.value = HANGMAN_THEMES.map(t => t.value);
    } else {
      selectedThemes.value = [];
    }
    showWarning.value = false;
    if (warningTimer) clearTimeout(warningTimer); // Очищаем таймер
  }
});

// Функция начала игры с проверкой
const startGame = () => {
  if (selectedThemes.value.length === 0) {
    // Очищаем предыдущий таймер, если он есть
    if (warningTimer) {
      clearTimeout(warningTimer);
      warningTimer = null;
    }

    showWarning.value = true;

    // Скрыть предупреждение через 2 секунды
    warningTimer = setTimeout(() => {
      showWarning.value = false;
      warningTimer = null;
    }, 2000);
    return;
  }

  // Переход на страницу игры с выбранными темами
  router.push({
    name: 'game',
    query: { themes: selectedThemes.value.join(',') }
  });
};
</script>

<template>
  <div id="hangman-theme-select-screen" class="screen" style="display: block;">
    <div class="container">
      <h1 class="h1 _text-center">Выберите тему</h1>

      <div class="themes-grid">
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
              @change="showWarning = false"
          />
          <span class="checkbox-custom"></span>
          <span class="theme-text">{{ theme.text }}</span>
        </label>
      </div>

      <div class="start-game">
        <!-- Предупреждение -->
        <div v-show="showWarning" class="warning-message">
          ⚠️ Пожалуйста, выберите хотя бы одну тему
        </div>

        <Button class="btn" @click="startGame">Начать</Button>
      </div>
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

.start-game {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.warning-message {
  position: absolute;
  top: -35px;
  background: rgba(255, 87, 34, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  animation: fadeInOut 2s ease;
  animation-fill-mode: forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); visibility: hidden; }
}
</style>