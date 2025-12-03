const USER_STORAGE_KEY = 'user';

export function readUserFromLocalStorage() {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(USER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn('Gagal membaca data user lokal:', error);
        return null;
    }
}

export function persistUserToLocalStorage(user) {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        window.dispatchEvent(new CustomEvent('user-data-updated', { detail: { user } }));
    } catch (error) {
        console.warn('Gagal menyimpan data user lokal:', error);
    }
}
