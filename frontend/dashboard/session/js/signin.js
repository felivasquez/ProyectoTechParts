import supabase from '../../js/client.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    const message = document.getElementById('app-message');

    function showMessage(text, type = 'success') {
        message.textContent = text;
        message.style.color = type === 'success' ? 'green' : 'red';
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 5000);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (!email || !password || !confirmPassword) {
            showMessage('Por favor, completa todos los campos.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden.', 'error');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                showMessage(`Error: ${error.message}`, 'error');
                return;
            }

            showMessage('Usuario registrado exitosamente. Revisa tu correo para confirmar tu cuenta.', 'success');
            form.reset();
        } catch (err) {
            console.error(err);
            showMessage('Error inesperado al registrar usuario.', 'error');
        }
    });
});