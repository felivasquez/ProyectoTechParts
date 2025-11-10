import supabase from '../../js/client.js';

document.addEventListener('DOMContentLoaded', () => {
    const appMessageElement = document.getElementById('app-message');
    const loginForm = document.getElementById('loginForm');

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
            showMessage('Por favor, ingresa tu email y contraseña.', 'error');
            return;
        }

        showMessage('Iniciando sesión...', 'black');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    showMessage('Credenciales incorrectas.', 'error');
                } else if (error.message.includes('Email not confirmed')) {
                    showMessage('Tu email no ha sido confirmado.', 'error');
                } else {
                    showMessage(`Error: ${error.message}`, 'error');
                }
                return;
            }

            if (data.user) {
                const username = data.user.user_metadata?.username || data.user.email;
                showMessage(`¡Bienvenido, ${username}!`, 'success');
                window.location.href = '/dashboard/dashboard.html'; // Redirige al dashboard
                loginForm.reset();
            } else {
                showMessage('No se pudo iniciar sesión.', 'error');
            }

        } catch (err) {
            console.error('Error inesperado:', err);
            showMessage('Ocurrió un error inesperado.', 'error');
        }
    });
});

// logica para cerrar sesión
const logoutButton = document.getElementById('logout-button');

if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error al cerrar sesión:', error.message);
            alert('Hubo un error al cerrar sesión.');
        } else {
            window.location.href = '/session/login.html';
        }
    });
}

