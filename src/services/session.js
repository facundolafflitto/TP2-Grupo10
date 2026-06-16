const STORAGE_KEY = "marketplace_sesion";

export function getSession() {
    const storedSession = localStorage.getItem(STORAGE_KEY);

    if (!storedSession) {
        return null;
    }

    try {
        return JSON.parse(storedSession);
    } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

export function getCurrentUser() {
    const session = getSession();
    return session ? session.usuario : null;
}

export function getToken() {
    const session = getSession();
    return session ? session.token : null;
}

export function setSession(usuario, token) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        usuario: usuario,
        token: token
    }));
    localStorage.removeItem("marketplace_usuario");
    window.dispatchEvent(new Event("session-changed"));
}

export function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("marketplace_usuario");
    window.dispatchEvent(new Event("session-changed"));
}

export function authHeaders() {
    const token = getToken();

    return token ? {
        Authorization: "Bearer " + token
    } : {};
}
