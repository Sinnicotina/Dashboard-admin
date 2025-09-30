import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * 🔐 CONTROLADOR DE AUTENTICACIÓN
 * 
 * Este archivo maneja todas las operaciones de autenticación:
 * - Registro de usuarios (con hash de contraseña)
 * - Login (validación de credenciales + JWT)
 * - Logout (limpieza de cookies)
 * - Verificación de usuario autenticado
 */

// Register: crea un usuario nuevo y guarda la contraseña hasheada
export async function register(req, res) {
  try {
    const { email, password, username } = req.body;
    
    // Validación básica de datos requeridos
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    // Verificar si el usuario ya existe
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }
    
    // Hash de la contraseña con bcrypt (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear y guardar el nuevo usuario
    const user = new User({ 
      email, 
      password: hashedPassword, 
      username: username || email.split('@')[0] // Usar email como username si no se proporciona
    });
    await user.save();
    
    // Respuesta sin datos sensibles
    res.status(201).json({ 
      id: user._id, 
      email: user.email, 
      username: user.username 
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * 🔑 LOGIN - Validación de credenciales y generación de JWT
 * 
 * Proceso:
 * 1. Validar datos de entrada (email, password)
 * 2. Buscar usuario en la base de datos
 * 3. Comparar contraseña hasheada con bcrypt
 * 4. Generar JWT con datos del usuario
 * 5. Enviar cookie httpOnly segura
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Validación de datos requeridos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    
    // Verificar configuración del servidor
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET no está definido en las variables de entorno');
      return res.status(500).json({ error: 'Configuración del servidor incompleta' });
    }
    
    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT con datos del usuario (expira en 4 horas)
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      }, 
      jwtSecret, 
      { expiresIn: '4h' }
    );

    // Configurar cookie httpOnly segura
    res.cookie('token', token, {
      httpOnly: true,        // No accesible desde JavaScript del cliente
      sameSite: 'lax',      // Protección CSRF
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      maxAge: 4 * 60 * 60 * 1000 // 4 horas en milisegundos
    });

    // Respuesta exitosa con datos del usuario (sin contraseña)
    res.json({ 
      ok: true, 
      user: { 
        id: user._id, 
        email: user.email, 
        username: user.username 
      } 
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * 🚪 LOGOUT - Limpieza de sesión
 * 
 * Elimina la cookie de autenticación del cliente
 */
export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ ok: true });
}

/**
 * 👤 ME - Información del usuario autenticado
 * 
 * Devuelve los datos del usuario basado en el token JWT
 * (el middleware auth debe haber validado y rellenado req.user)
 */
export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error obteniendo usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
