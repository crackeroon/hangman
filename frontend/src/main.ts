import { createApp } from 'vue';
import App from './app.vue';
import useGlobalVariables from '@/composables/global-variables';


// Автоматическая перезагрузка при ошибке загрузки JS модулей при деплое измененнной версии фронтенда
// Проверка на кол-во перезагрузок, чтобы избежать бесконечной перезагрузки
window.addEventListener('vite:preloadError', () => {
    const count = localStorage.getItem('viteRefreshCount') || '0';
    if (+count < 2) {
        localStorage.setItem('viteRefreshCount', count);
        window.location.reload();
    }
});
const app = createApp(App);

const {
    router,
    store,
    attachAppComponentsAndDirectives,
} = useGlobalVariables();

attachAppComponentsAndDirectives(app);

app.use(store);
app.use(router);

app.mount('#app');

export { app };
