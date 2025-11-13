import { supabase } from '../../js/supabaseConfig.js';

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

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        // Validaciones
        if (!fullName || !email || !password || !confirmPassword) {
            showMessage('Por favor, completa todos los campos.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden.', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }

        try {
            console.log('📧 Iniciando registro...');

            // Obtener la URL actual para el redirect
            const redirectUrl = `${window.location.origin}/tienda/login.html`;
            
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    },
                    emailRedirectTo: redirectUrl
                }
            });

            if (error) {
                console.error('❌ Error en signup:', error);
                showMessage(`Error: ${error.message}`, 'error');
                return;
            }

            console.log('✅ Respuesta de signup:', data);

            // Verificar si necesita confirmación de email
            if (data?.user && !data.user.confirmed_at) {
                showMessage(
                    '✅ Registro exitoso! Por favor revisa tu correo electrónico para confirmar tu cuenta.',
                    'success'
                );
                console.log('📧 Email de confirmación enviado a:', email);
            } else if (data?.user && data.user.confirmed_at) {
                // El usuario fue confirmado automáticamente
                showMessage(
                    '✅ Usuario registrado y confirmado exitosamente! Redirigiendo...',
                    'success'
                );
                setTimeout(() => {
                    window.location.href = './login.html';
                }, 2000);
            }

            form.reset();

        } catch (err) {
            console.error('❌ Error inesperado:', err);
            showMessage('Error inesperado al registrar usuario.', 'error');
        }
    });
});