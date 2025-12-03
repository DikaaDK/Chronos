import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;
let cachedToken = null;

const DEFAULT_API_URL = 'http://127.0.0.1:8000/api';

const normalizeBackendUrl = (apiUrl) => {
    if (!apiUrl) {
        return 'http://127.0.0.1:8000';
    }

    return apiUrl.replace(/\/$/, '').replace(/\/api$/, '');
};

const buildEchoOptions = (token) => {
    const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1';
    const scheme = (import.meta.env.VITE_PUSHER_SCHEME || 'https').toLowerCase();
    const host = import.meta.env.VITE_PUSHER_HOST || null;
    const port = import.meta.env.VITE_PUSHER_PORT || null;
    const backendUrl = normalizeBackendUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL);

    const options = {
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster,
        forceTLS: scheme === 'https',
        disableStats: true,
        authEndpoint: `${backendUrl}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Requested-With': 'XMLHttpRequest',
            },
        },
    };

    if (host) {
        options.wsHost = host;
        options.wsPort = port || 80;
        options.wssPort = port || 443;
        options.enabledTransports = ['ws', 'wss'];
    }

    return options;
};

const disconnectEchoInstance = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};

const ensurePusherBinding = () => {
    if (!window.Pusher) {
        window.Pusher = Pusher;
    }
};

const getEchoInstance = (token) => {
    if (!token) {
        disconnectEchoInstance();
        cachedToken = null;
        return null;
    }

    if (echoInstance && cachedToken === token) {
        return echoInstance;
    }

    const options = buildEchoOptions(token);

    if (!options.key) {
        console.warn('Echo instance skipped: missing PUSHER key.');
        return null;
    }

    disconnectEchoInstance();
    ensurePusherBinding();

    echoInstance = new Echo(options);
    cachedToken = token;

    return echoInstance;
};

const resetEchoInstance = () => {
    cachedToken = null;
    disconnectEchoInstance();
};

window.getEchoInstance = getEchoInstance;
window.resetEchoInstance = resetEchoInstance;

window.addEventListener('beforeunload', () => {
    resetEchoInstance();
});
