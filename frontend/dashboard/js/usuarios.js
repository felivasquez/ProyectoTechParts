import supabase from './client.js';

async function checkSession() {
    const { data, error } = await supabase.auth.getSession();
    if (!data.session) {
        window.location.href = 'session/login.html';
    } else {
        // Muestra el nombre de usuario en el dashboard
        const username = data.session.user.user_metadata?.username || data.session.user.email;
        document.getElementById('username').textContent = `Bienvenido, ${username}`;
    }
}
checkSession();

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert('Hubo un error al cerrar sesión.');
            } else {
                window.location.href = 'session/login.html';
            }
        });
    }
    cargarUsuarios();
});

async function cargarUsuarios() {
    const { data: usuarios, error } = await supabase
        .from('vw_user_roles')
        .select('*');
    if (error) {
        console.error('Error al cargar usuarios:', error);
        return;
    }

    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = usuarios.map(usuario => `
        <tr class="border-b transition-colors hover:bg-muted/50">
            <td class="p-4 align-middle font-medium">${usuario.user_metadata?.username || '-'}</td>
            <td class="p-4 align-middle">
                <div class="flex items-center gap-2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail h-4 w-4">
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    ${usuario.email || '-'}
                </div>
            </td>
            <td class="p-4 align-middle">
                <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                    ${usuario.role || 'user'}
                </div>
            </td>
            <td class="p-4 align-middle">
                <div class="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar h-4 w-4 text-muted-foreground">
                        <path d="M8 2v4"></path>
                        <path d="M16 2v4"></path>
                        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                        <path d="M3 10h18"></path>
                    </svg>
                    ${new Date(usuario.user_created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            </td>
        </tr>
    `).join('');

    // Actualizar contador de usuarios
    const contador = document.querySelector('.inline-flex.items-center.rounded-full.border.px-2\\.5.py-0\\.5.font-semibold');
    if (contador) {
        contador.textContent = `${usuarios.length} usuario${usuarios.length === 1 ? '' : 's'}`;
    }
}