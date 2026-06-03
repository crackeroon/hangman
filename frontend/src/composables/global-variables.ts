

import { App as AppType } from '@vue/runtime-core';
import { createPinia } from 'pinia';
import router from '@/router/index';

const store = createPinia();
export default function() {
  const attachAppComponentsAndDirectives = (app: AppType) => {


    return app;
  };
  return {
    router,
    store,
    attachAppComponentsAndDirectives,
  };
};
