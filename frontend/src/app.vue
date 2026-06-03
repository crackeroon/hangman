<template>
  <div class="wrapper-app" :class="theme">
    <div></div>
    <div class="content" >
      <router-view></router-view>
    </div>
    <div class="theme-change">
      <Button @click="updateTheme">
        <img class="image-theme" :src="srcImageTheme" alt="">
      </Button>
    </div>

  </div>
</template>

<script lang="ts" setup>

/*import UserService from '@/services/user-service';*/

import { PubSubEvents } from '@/types/enums';
import {getCurrentInstance, onMounted, computed, ref} from 'vue';
import { useCoreStore } from '@/store';

import {getTheme, Theme, ThemeImage, toggleTheme} from '@/services/theme-type';
import Button from "@/components/ui/Button.vue";

const coreHelpers = useCoreStore();

const theme = ref(getTheme());

const srcImageTheme = computed(() => {
  return ThemeImage[theme.value]
})

const updateTheme = () => {
  theme.value = toggleTheme()
}

/*const root: any = getCurrentInstance()?.proxy;
const { hidePopoverOnTouchEmptySpace } = useHidePopoverOnMobile();*/

/*onMounted(() => {
  hidePopoverOnTouchEmptySpace();
});*/

const loading = computed(() => coreHelpers.getLoading);
/*UserService.instance.subscribe(PubSubEvents.LOGOUT, () => {
  root.$router.push({ name: PubSubEvents.LOGIN });
});*/

</script>

<style lang="scss">
@use './scss/global' as *;


.wrapper-app {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 1rem;
}

  .content {
    height: 100%;
    overflow: auto;
  }

  .image-theme {
    width: 70px;
  }

  .theme-change {
    display: flex;
    align-items: start;
    justify-content: end;
  }
</style>
