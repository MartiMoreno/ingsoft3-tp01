# Gestor de Tareas - IngSoft3

Aplicación de gestión de tareas: backend en Node.js/Express, frontend en React, base de datos PostgreSQL. Contenerizada con Docker.

## Instalación
```
git clone https://github.com/MartiMoreno/ingsoft3-tp01.git
cd ingsoft3-tp01
```

## Arrancar el sistema completo (con Docker)

### 1. Configurar variables de entorno
```
cp .env.example .env
```

(Podés editar `.env` y poner la contraseña que quieras — es solo para tu base local.)

### 2. Levantar todo con Docker Compose
```
docker compose up -d --build
```

Esto levanta tres servicios: `db` (PostgreSQL), `backend` (API en Node/Express) y `frontend` (React servido por nginx).


### 3. Crear la tabla (solo la primera vez, con un volumen nuevo)
```
docker compose exec db psql -U postgres -d tareas
```
Dentro de la consola de PostgreSQL, pegar:

```sql
CREATE TABLE tareas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha_limite DATE,
  prioridad VARCHAR(10) NOT NULL CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA')),
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

Salir con `\q`.

### 4. Verificar

Abrir el navegador en http://localhost:3000

## Levantar con las imágenes publicadas (sin construir)
```
docker compose -f docker-compose.registry.yml up -d
```
Usa las imágenes públicas en ghcr.io en vez de construir desde el código local.

## Stack

- Backend: Node.js + Express + PostgreSQL (paquete `pg`)
- Frontend: React (Vite) servido por nginx en producción
- Base de datos: PostgreSQL 16

