import supabase from './../../../../backend/config/client.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const appMessageElement = document.getElementById('app-message');

    function showMessage(message, type = 'success') {
        appMessageElement.textContent = message;
        appMessageElement.style.color = type === 'success' ? 'green' : 'red';
        appMessageElement.style.display = 'block';
        setTimeout(() => {
            appMessageElement.style.display = 'none';
        }, 5000);
    }


    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            showMessage('Por favor, ingresa tu email y contraseña.');
            return;
        }

        try {
            // 1. Iniciar sesión con email y contraseña
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    showMessage('Credenciales incorrectas.');
                } else if (error.message.includes('Email not confirmed')) {
                    showMessage('Tu email no ha sido confirmado.');
                } else {
                    showMessage(`Error: ${error.message}`);
                }
                return;
            }

            if (data.user) {
                const userId = data.user.id;

                // 2. Verificar el rol del usuario
                const { data: roles, error: roleError } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', userId)
                    .single(); // solo debería haber un rol por usuario

                if (roleError) {
                    console.error('Error al verificar el rol:', roleError.message);
                    showMessage('No se pudo verificar el rol del usuario.');
                    return;
                }

                // 3. Permitir solo a los que tengan rol 'user'
                if (roles && roles.role === 'user') {
                    const username = data.user.user_metadata?.username || data.user.email;
                    showMessage(`¡Bienvenido, ${username}!`);
                    window.location.href = '../';
                    loginForm.reset();

                } else {
                    showMessage('Si eres administrador, usa el panel de administración.');
                    // Cerrar sesión para limpiar cualquier sesión iniciada
                    await supabase.auth.signOut();
                }
            } else {
                console.log('No se pudo iniciar sesión.');
            }
        } catch (err) {
            console.error('Error inesperado:', err);
            showMessage('Ocurrió un error inesperado.');
        }
    });
});