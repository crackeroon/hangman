import { acceptHMRUpdate, StoreDefinition } from 'pinia';

export const enableHotReload = (module: StoreDefinition) => {
  if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(module, import.meta.hot));
  }
};
