import { defineStore } from 'pinia';
import { enableHotReload } from '@/services/enable-hot-reload';

interface ICoreStore {
  loading: number,
}

export const useCoreStore = defineStore('core', {
  state: (): ICoreStore => ({
    loading: 0,
  }),
  getters: {
    getLoading: state => state.loading > 0,
  },
  actions: {
    startLoading() {
      this.loading++;
    },
    stopLoading() {
      this.loading--;
    },
  },
});

enableHotReload(useCoreStore);
