const { Pool } = require('pg');
require('dotenv').config();

// En Render se usa DATABASE_URL (Neon, ya trae sslmode=require);
// en docker compose, las variables sueltas de siempre.
const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

// Crea la tabla si todavía no existe (mismo CREATE TABLE del README)
pool.asegurarEsquema = () => pool.query(`
    CREATE TABLE IF NOT EXISTS tareas (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(200) NOT NULL,
      descripcion TEXT,
      fecha_limite DATE,
      prioridad VARCHAR(10) NOT NULL CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA')),
      estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA')),
      created_at TIMESTAMP DEFAULT NOW()
    );
`);

module.exports = pool;