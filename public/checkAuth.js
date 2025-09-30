// Al cargar el dashboard, comprobamos si el usuario está autenticado
export default async function checkAuth() {
  try {
    const res = await fetch('/auth/me', { credentials: 'include' });
    if (res.ok) {
      return true;
    }
    // no autorizado -> redirigir
    window.location.href = '/login.html';
    return false;
  } catch (err) {
    console.error('auth check error', err);
    window.location.href = '/login.html';
    return false;
  }
}
