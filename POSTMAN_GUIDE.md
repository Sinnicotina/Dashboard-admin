# 🚀 GUÍA DE POSTMAN PARA STOCKPILOT

## 📋 Configuración Inicial

### 1. Variables de Entorno en Postman

#### Paso 1: Crear un Entorno
1. **Abre Postman**
2. **Haz clic en el ícono de engranaje** (⚙️) en la esquina superior derecha
3. **Selecciona "Manage Environments"**
4. **Haz clic en "Add"**
5. **Nombre del entorno**: `StockPilot Local`
6. **Haz clic en "Add"**

#### Paso 2: Configurar Variables
En el entorno que acabas de crear, añade estas variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:5000` | `http://localhost:5000` |
| `token` | (vacío) | (vacío) |
| `user_email` | `tu_email@ejemplo.com` | `tu_email@ejemplo.com` |
| `user_password` | `tu_contraseña` | `tu_contraseña` |

#### Paso 3: Seleccionar el Entorno
1. **En la esquina superior derecha**, selecciona el entorno `StockPilot Local`
2. **Verifica que aparezca** el nombre del entorno seleccionado

## 🔐 PASO 1: LOGIN (Obtener Token)

### Request: Login
- **Método**: `POST`
- **URL**: `{{base_url}}/auth/login`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "{{user_email}}",
    "password": "{{user_password}}"
  }
  ```

### Script Post-Response (Tests tab):
```javascript
// Verificar que el login fue exitoso
pm.test("Login exitoso", function () {
    pm.response.to.have.status(200);
    const responseJson = pm.response.json();
    pm.expect(responseJson.ok).to.be.true;
});

// Extraer token de la cookie y guardarlo en variable
const cookies = pm.response.headers.get("Set-Cookie");
console.log("Cookies recibidas:", cookies);

if (cookies) {
    // Buscar el token en las cookies
    const tokenMatch = cookies.match(/token=([^;]+)/);
    if (tokenMatch) {
        const token = tokenMatch[1];
        pm.environment.set("token", token);
        console.log("✅ Token guardado:", token);
        
        // Verificar que el token se guardó correctamente
        pm.test("Token guardado en variable", function () {
            pm.expect(pm.environment.get("token")).to.not.be.undefined;
        });
    } else {
        console.error("❌ No se encontró token en las cookies");
    }
} else {
    console.error("❌ No se recibieron cookies del servidor");
}
```

## 🔍 PASO 1.5: VERIFICAR AUTENTICACIÓN (OPCIONAL)

### Request: Verificar Usuario Autenticado
- **Método**: `GET`
- **URL**: `{{base_url}}/auth/me`
- **Headers**:
  ```
  Cookie: token={{token}}
  ```

**Si este request devuelve 200 con datos del usuario, la autenticación está funcionando.**

## 🛍️ PASO 2: AGREGAR PRODUCTO

### Request: Crear Producto
- **Método**: `POST`
- **URL**: `{{base_url}}/products`
- **Headers**:
  ```
  Content-Type: application/json
  Cookie: token={{token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "nombre": "Producto de Prueba",
    "stock": "50",
    "price": 29.99,
    "img": "https://via.placeholder.com/300x300?text=Producto+Prueba"
  }
  ```

## 📦 PASO 3: OBTENER PRODUCTOS

### Request: Listar Productos
- **Método**: `GET`
- **URL**: `{{base_url}}/products`
- **Headers**:
  ```
  Cookie: token={{token}}
  ```

## ✏️ PASO 4: ACTUALIZAR PRODUCTO

### Request: Actualizar Producto
- **Método**: `PUT`
- **URL**: `{{base_url}}/products/{product_id}`
- **Headers**:
  ```
  Content-Type: application/json
  Cookie: token={{token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "nombre": "Producto Actualizado",
    "stock": "75",
    "price": 35.99
  }
  ```

## 🗑️ PASO 5: ELIMINAR PRODUCTO

### Request: Eliminar Producto
- **Método**: `DELETE`
- **URL**: `{{base_url}}/products/{product_id}`
- **Headers**:
  ```
  Cookie: token={{token}}
  ```

## 🔍 PASO 6: OBTENER PRODUCTO ESPECÍFICO

### Request: Ver Producto
- **Método**: `GET`
- **URL**: `{{base_url}}/products/{product_id}`
- **Headers**:
  ```
  Cookie: token={{token}}
  ```

## ⚠️ NOTAS IMPORTANTES

1. **Siempre haz LOGIN primero** para obtener el token
2. **Usa la cookie `token`** en todas las peticiones protegidas
3. **El token expira en 4 horas**, necesitarás hacer login de nuevo
4. **Reemplaza `{product_id}`** con el ID real del producto
5. **El servidor debe estar corriendo** en `http://localhost:5000`

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error 401 (No autorizado):

#### 1. Verificar que el login fue exitoso:
- **Revisa la consola de Postman** (Console tab)
- **Deberías ver**: "✅ Token guardado: [token]"
- **Si no aparece**: El login falló o el script no funciona

#### 2. Verificar que el token se guardó:
- **Ve a tu entorno** (esquina superior derecha)
- **Haz clic en el ojo** para ver variables
- **Verifica que `token` tenga un valor**

#### 3. Verificar el formato del token:
- **El token debe ser una cadena larga** (ej: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
- **No debe tener espacios** ni caracteres extraños

#### 4. Probar autenticación:
- **Ejecuta el request `/auth/me`** primero
- **Si devuelve 200**: La autenticación funciona
- **Si devuelve 401**: El token es inválido o expiró

### Error 500 (Server error):
- Verifica que el servidor esté corriendo (`npm run dev`)
- Revisa los logs del servidor en la terminal
- Verifica que el archivo `.env` esté configurado

### Error de conexión:
- Verifica que la URL base sea `http://localhost:5000`
- Asegúrate de que el servidor esté en el puerto 5000
- Verifica que no haya firewall bloqueando

### Token expirado:
- **Los tokens expiran en 4 horas**
- **Haz login de nuevo** para obtener un token fresco
- **Verifica la fecha/hora** de tu sistema
