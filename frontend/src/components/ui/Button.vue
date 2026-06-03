<template>
  <button :class="classes" :type="type">
    <div v-if="hasSlot('default')">
      <slot></slot>
    </div>
    <div v-if="hasSlot('icon')" class="ui-icon" :style="iconStyle">
      <slot name="icon"></slot>
    </div>
  </button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  props: {
    secondary: {
      type: Boolean,
      default: false,
    },
    tertiary: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'button',
    },
    iconLeft: {
      type: Boolean,
      default: false,
    },
    iconStyle: {
      type: String,
      default: '',
    },
  },
  setup({ secondary, tertiary, iconLeft }, { slots }) {
    const hasSlot = (slot: 'icon' | 'default') => {
      return !!slots[slot];
    };

    const classes = computed(() => {
      const classes: Array<string> = ['ui-button'];

      if (secondary) {
        classes.push('ui-button--secondary');
      } else if (tertiary) {
        classes.push('ui-button--tertiary');
      } else {
        classes.push('ui-button--primary');
      }

      if (hasSlot('icon')) {
        classes.push('ui-button--icon');
      }

      if (iconLeft) {
        classes.push('ui-button--icon-left');
      }

      return classes;
    });

    return {
      classes,
      hasSlot,
    };
  },
});
</script>

<style lang="scss" scoped>
.ui-button {
  padding: 18.5px 28px;
  border: none;
  border-radius: 8px;

  font-family: 'Golos';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  text-align: center;

  &--icon {
    display: flex;
    align-items: center;
    gap: 12px;

    &-left {
      flex-direction: row-reverse;
    }
  }

  &--primary {
    background-color: var(--primary-color-800);
    color: var(--white);

    &:hover {
      background-color: var(--primary-color-700);
    }
    &:active {
      background-color: var(--primary-color-900);
    }
    &:disabled {
      background-color: var(--primary-color-0);
      color: var(--disabled-color);
      cursor: not-allowed;
    }
  }

  &--secondary {
    color: var(--primary-color-800);
    border-color: var(--primary-color-800);
    border-radius: 8px;
    border: 1px solid;
    background-color: transparent;

    &:hover {
      border-color: var(--primary-color-700);
      background-color: var(--primary-color-700);
      color: var(--white);
    }
    &:active {
      border-color: var(--primary-color-900);
      background-color: transparent;
      color: var(--primary-color-900);
    }
    &:disabled {
      border-color: var(--disabled-color);
      background-color: transparent;
      color: var(--disabled-color);
    }
  }

  &--tertiary {
    color: var(--primary-color-800);
    background-color: transparent;

    &:hover {
      color: var(--primary-color-700);
    }
    &:active {
      color: var(--primary-color-900);
    }
    &:disabled {
      color: var(--disabled-color);
    }
  }

  @media screen and (max-width: 1440px) {
    font-size: 14px;
    padding: 11.5px 17px;
    gap: 11px;
  }

  @media screen and (max-width: 1920px) {
    padding: 14.5px 22px;
  }

  &:focus {
    outline: none;
  }
}
</style>
