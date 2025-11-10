import supabase from '/backend/config/client.js';

// Función para redirigir si no hay sesión activa
export async function checkSession(redirect = true) {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user && redirect) {
        window.location.href = '/dashboard/session/login.html';
    }

    return user;
}

// Función para cerrar sesión
export async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/dashboard/session/login.html';
}

// Escuchar cambios de sesión
supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = '/dashboard/session/login.html';
    }
});
