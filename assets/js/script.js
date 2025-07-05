import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://pnzqktwmycllrygppjnw.supabase.co'
const supabaseKey = 'peyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuenFrdHdteWNsbHJ5Z3Bwam53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTQ1NDcsImV4cCI6MjA2NzIzMDU0N30.Iv8X6Ko_VK-TXPYWNvkJ0xZ6jH8ahmuk0j6Xy-uly_I'
const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            showMessage('Por favor, ingresa tu email y contraseña.', 'error');
            return;
        }

        showMessage('Iniciando sesión...', 'black'); // Mensaje de carga

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Error al iniciar sesión:', error);
                if (error.message.includes('Invalid login credentials')) {
                    showMessage('Credenciales incorrectas. Verifica tu email y contraseña.', 'error');
                } else if (error.message.includes('Email not confirmed')) {
                    showMessage('Tu email no ha sido confirmado. Revisa tu bandeja de entrada o spam.', 'error');
                } else {
                    showMessage(`Error al iniciar sesión: ${error.message}`, 'error');
                }
                return;
            }

            if (data.user) {
                const username = data.user.user_metadata.username || data.user.email;
                showMessage(`¡Inicio de sesión exitoso! Bienvenido, ${username}!`, 'success');
                console.log('Usuario logueado:', data.user);
                window.location.href = 'index.html';
                loginForm.reset();
            } else {
                showMessage('No se pudo iniciar sesión. Verifica tus credenciales.', 'error');
            }

        } catch (err) {
            console.error('Error inesperado al iniciar sesión:', err);
            showMessage('Ocurrió un error inesperado durante el inicio de sesión.', 'error');
        }
    });
});