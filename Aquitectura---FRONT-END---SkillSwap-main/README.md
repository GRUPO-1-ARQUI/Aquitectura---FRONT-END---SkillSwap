# SkillSwap 🎓🔄

**Red interuniversitaria de intercambio de habilidades.** Plataforma web donde estudiantes de distintas universidades se conectan para enseñarse entre sí: un aprendiz busca un tutor de otra institución, le solicita una tutoría, el tutor la acepta o rechaza, realizan la sesión y el aprendiz lo califica. Un coordinador valida la autenticidad de los usuarios.

Proyecto full-stack con **frontend Angular** y **backend Spring Boot**, conectados mediante autenticación **JWT**.

---

## 🧩 Arquitectura

| Capa | Tecnología | Puerto |
|------|-----------|--------|
| Frontend | Angular 22 (standalone components, signals) | `4200` |
| Backend | Spring Boot 3.3.5 (Java 21) + Spring Security + JWT | `8080` |
| Base de datos | PostgreSQL (`innovify_db`) | `5432` |

El frontend consume el API REST del backend (`http://localhost:8080/api`). Cada petición protegida viaja con el token JWT en el header `Authorization: Bearer {token}`.

---

## ✅ Requisitos previos

- **Java 21** (JDK)
- **Maven** (incluido vía `mvnw`)
- **Node.js 18+** y **npm**
- **Angular CLI 22** (`npm install -g @angular/cli`)
- **PostgreSQL 15+** corriendo localmente

---

## 🚀 Puesta en marcha (de cero)

### 1. Base de datos
Crea la base de datos en PostgreSQL:
```sql
CREATE DATABASE innovify_db;
```
Verifica que las credenciales en `backend/src/main/resources/application.properties` coincidan con tu instalación (por defecto usuario `postgres`, contraseña `postgre`).

### 2. Backend
```bash
cd backend
./mvnw spring-boot:run        # En Windows: .\mvnw.cmd spring-boot:run
```
Al **primer arranque**, Hibernate crea automáticamente las tablas y el archivo `data.sql` carga los **datos de prueba** (instituciones, usuarios, habilidades, etc.). No necesitas tocar la base de datos manualmente.

Espera el mensaje `Started InnovifyApplication ... (port 8080)`.

### 3. Frontend
En otra terminal:
```bash
cd frontend
npm install
ng serve
```
Abre **http://localhost:4200**.

---

## 👤 Cuentas de prueba

Los datos semilla crean tres usuarios listos para usar. **Contraseña de todos: `123456`**

| Rol | Correo | Qué puede hacer |
|-----|--------|-----------------|
| Estudiante | `alexandra@upc.edu.pe` | Buscar tutores, solicitar tutoría, recibir notificaciones, calificar |
| Tutor | `victor@uni.edu.pe` | Ver solicitudes recibidas, aceptar/rechazar |
| Coordinador | `coord@upc.edu.pe` | Listar y aprobar/rechazar verificaciones |

> ℹ️ Las tres cuentas son de **instituciones distintas** a propósito: SkillSwap solo permite emparejamientos **interuniversitarios** (un aprendiz no puede pedir tutoría a alguien de su misma universidad).

---

## ⭐ Funcionalidades implementadas

**Estudiante / Aprendiz**
- Buscar tutores con filtros por habilidad
- Ver perfil detallado del tutor con su reputación promedio
- Solicitar tutoría (con habilidad y mensaje)
- Recibir notificaciones (ej. aceptación de solicitud)
- Calificar al tutor tras la sesión

**Tutor**
- Ver solicitudes recibidas con los datos del aprendiz
- Aceptar o rechazar solicitudes
- Recibir notificaciones

**Coordinador**
- Listar verificaciones pendientes
- Ver los datos del estudiante a verificar
- Aprobar o rechazar verificaciones

---

## 🔑 Notas técnicas

- **Autenticación:** el login (`POST /api/usuarios/login`) devuelve un JWT que el frontend guarda y reenvía automáticamente vía un *HTTP interceptor*. Las rutas privadas están protegidas con un *guard*.
- **Roles:** `estudiante`, `tutor`, `coordinador`. Tras el login, la app redirige a la zona correspondiente según el rol.
- **Datos semilla:** `data.sql` es idempotente (usa `ON CONFLICT DO NOTHING`), así que puedes reiniciar el backend sin duplicar ni romper datos. Las contraseñas se guardan con hash **BCrypt**.
- **Seguridad:** solo `POST /api/usuarios` (registro) y `POST /api/usuarios/login` son públicos; el resto requiere token.

---

## 📁 Estructura

```
skillswap/
├── backend/        # API REST Spring Boot (com.upc.innovify)
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql        # datos de prueba (carga automática)
└── frontend/       # App Angular (skill-swap-v2)
    └── src/app/
        ├── services/       # consumo del API
        ├── interceptors/   # JWT
        ├── models/         # interfaces
        └── componentes/    # pantallas y landing
```

---

## 🛠️ Solución de problemas

| Problema | Causa / Solución |
|----------|------------------|
| Login falla con cuentas de prueba | Verifica que el backend arrancó y que `data.sql` cargó (revisa el log). |
| `ECONNREFUSED 127.0.0.1:8080` | El backend no está corriendo. Arráncalo. |
| Error de CORS | El backend ya permite `http://localhost:4200`. Asegúrate de usar ese puerto en el front. |
| No aparecen tutores/solicitudes | La base puede estar vacía. Reinicia el backend para que cargue `data.sql`. |
| Solicitud da 400 "misma institución" | Aprendiz y tutor deben ser de universidades distintas (regla interuniversitaria). |

---

*Proyecto académico — Arquitecturas de Aplicaciones Web (UPC).*
