/**
 * 🔐 LOGIN FRONTEND
 * 
 * Maneja el formulario de login:
 * - Captura email y contraseña
 * - Envía credenciales al servidor
 * - Redirige al dashboard si es exitoso
 * - Muestra errores si falla
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;
  
  // Manejar envío del formulario de login
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = form.querySelector('#email')?.value;
    const password = form.querySelector('#password')?.value;
    
    // Validación básica
    if (!email || !password) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    try {
      // Enviar credenciales al servidor
      const res = await fetch('/auth/login', {
        method: 'POST',
        credentials: 'include', // Importante para cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Error al iniciar sesión');
        return;
      }
      
      // Login exitoso -> redirigir al dashboard
      window.location.href = '/';
    } catch (err) {
      console.error('Error en login:', err);
      alert('Error de conexión. Intenta de nuevo.');
    }
  });
});
