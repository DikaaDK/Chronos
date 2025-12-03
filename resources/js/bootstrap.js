import axios from 'axios';
import './lib/realtime';

window.axios = axios;

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';

window.axios.defaults.baseURL = apiBaseUrl;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['X-Locale'] = window.__APP_LOCALE__ ?? 'id';
