# Decisiones — TP1

## 1. Conflicto

Git no pudo resolver el conflicto automáticamente porque las ramas `feature/titulo-a` y `feature/titulo-b` modificaron la misma línea del archivo `README.md` de manera diferente.

El conflicto no habría aparecido si las ramas hubieran modificado líneas distintas.

## 2. Problemas encontrados

Al crear la protección de la rama `main`, la primera vez la configuración no se guardó por un problema de autenticación en GitHub. Por eso el primer push directo fue aceptado. Luego volví a crear la regla y repetí la prueba, donde el push fue rechazado correctamente.

También tuve un problema con el archivo `README.md`, ya que GitHub lo reconocía como un archivo binario. Lo corregí reescribiendo el archivo y realizando la corrección mediante una rama y un Pull Request.

## 3. Uso de inteligencia artificial

Utilicé inteligencia artificial como ayuda para interpretar las consignas, entender comandos de Git y GitHub y resolver los problemas que aparecieron durante el TP.

Verifiqué las indicaciones ejecutando los comandos y comprobando los resultados directamente en GitHub.

## TP2 — Contenedores

### Elección de la app

Elegí construir una app propia: un Gestor de Tareas (Node.js/Express + React + PostgreSQL), en vez de usar un proyecto existente de GitHub.

Contra los criterios de la guía:
- **¿Buildea y corre localmente hoy?** Sí, se probó paso a paso: primero sin Docker (Express solo, después con PostgreSQL en contenedor), y recién después se contenerizó.
- **¿Tiene reglas de negocio?** Sí: la tabla `tareas` tiene restricciones `CHECK` a nivel de base de datos para `prioridad` (BAJA/MEDIA/ALTA) y `estado` (PENDIENTE/EN_PROGRESO/COMPLETADA) — la base rechaza valores inválidos.
- **¿Entiendo el código?** Sí, se escribió línea por línea, entendiendo cada archivo (conexión a la base separada en `db.js`, rutas en `index.js`).
- **Tamaño:** 2 pantallas (listado + formulario en una sola vista), CRUD básico (crear y listar por ahora).

### Decisiones de contenerización

- **Backend:** Dockerfile de una sola etapa relevante (Node no necesita compilar), imagen base `node:20-alpine` por ser liviana. Se usó `npm ci --omit=dev` para no instalar dependencias de desarrollo en la imagen final.
- **Frontend:** Dockerfile multi-stage real: una etapa con Node para compilar React (`npm run build`), y otra con `nginx:alpine` que solo sirve los archivos estáticos ya compilados — la imagen final no tiene ni Node ni el código fuente.
- **Comunicación front-back:** se usó ruta relativa (`/api/...`) con proxy en nginx, en vez de URL absoluta con CORS. Esto significó cambiar las rutas del backend de `/tareas` a `/api/tareas`, y la URL del frontend de `http://localhost:3001` a `/api`.
- **Persistencia:** volumen nombrado `db_data` para PostgreSQL, así los datos sobreviven a `docker compose down` (sin `-v`).
- **Secretos:** contraseña de la base vía `.env` (no commiteado, con `.env.example` de plantilla).
- **Registry:** se usó ghcr.io (GitHub Container Registry), con las dos imágenes publicadas en modo público, tag `v0.1.0`.

### Problemas encontrados y cómo los resolví

1. **PowerShell no acepta sintaxis de `curl` estilo Unix.** Los comandos `curl -X POST -H ... -d ...` de la guía no funcionan tal cual en PowerShell. Se resolvió usando `Invoke-RestMethod` con su sintaxis propia.

2. **`git checkout main` se rompió a mitad de camino** por archivos bloqueados de Windows (carpetas `frontend/public`, `frontend/src/assets`, `img`), dejando la rama local desincronizada de lo que decía `git status`. Se detectó comparando `git log` (mostraba el commit viejo del TP1) contra lo que realmente había en disco (`ls backend` no mostraba los archivos del código). Se resolvió con `git pull origin main`, que sí trajo todo bien (fast-forward).

3. **Error "relation tareas does not exist" al levantar con Docker Compose.** La tabla se había creado a mano en un contenedor de prueba (`tareas-db`) que después se borró. Al levantar el compose, PostgreSQL creó un volumen nuevo, vacío. Se resolvió corriendo el `CREATE TABLE` de nuevo, esta vez dentro del contenedor `db` del compose (`docker compose exec db psql...`). Esto se documentó en el `README.md` como parte del arranque, porque es necesario la primera vez que alguien clona el repo y levanta el sistema.

4. **Windows generó archivos `desktop.ini`** en dos carpetas distintas durante el trabajo — se identificaron y borraron manualmente antes de cada commit, para no ensuciar el repo.

### Uso de IA

Usé Claude como profesor/asistente técnico durante todo el TP: para explicar conceptos nuevos (contenedores, multi-stage builds, nginx como proxy, healthchecks), para generar el código base (Dockerfiles, docker-compose.yml, nginx.conf) que después revisé y entendí, y para diagnosticar errores reales (el de la tabla faltante, el de PowerShell, el del checkout roto). Verifiqué cada paso ejecutándolo yo misma y confirmando el resultado antes de avanzar al siguiente.