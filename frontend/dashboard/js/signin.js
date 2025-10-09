import supabase from './client.js';

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (password !== confirmPassword) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }

    // 1. Registrar usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: email.split('@')[0]
            }
        }
    });

    if (error) {
        showMessage('Error al registrar: ' + error.message, 'error');
        return;
    }

    // 2. Insertar en user_roles como admin
    const user_id = data.user?.id;
    if (user_id) {
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{ user_id, role: 'admin' }]);
        if (roleError) {
            showMessage('Usuario creado pero error al asignar rol admin: ' + roleError.message, 'error');
            return;
        }
    }

    showMessage('Registro exitoso. Ahora eres admin.', 'success');
    // Redirigir o iniciar sesión automáticamente si lo deseas
    setTimeout(() => {
        window.location.href = '../dashboard.html';
    }, 1500);
});

function showMessage(msg, type = 'info') {
    const el = document.getElementById('app-message');
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = type === 'error' ? 'red' : 'green';
}