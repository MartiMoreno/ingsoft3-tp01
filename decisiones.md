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

## TP3 — Planificación y trazabilidad

### Duración del sprint

Elegí sprints de **1 semana**. Al ser un TP universitario con entregas y defensas frecuentes (no un proyecto real de varios meses), un sprint corto da feedback rápido y se alinea mejor con el calendario de cursada que un sprint de 2-4 semanas, que sería demasiado largo para el ritmo de esta materia.

### Límite de trabajo en progreso (WIP)

Configuré el límite en **2** para la columna "In Progress". La regla de arranque es "cantidad de personas + 1"; trabajando sola, eso da 1 + 1 = 2. El "+1" permite tener algo esperando (una revisión, por ejemplo) sin bloquear el avance en otra cosa, sin que el límite deje de cumplir su función de evitar acumular trabajo a medio terminar.

### Diagnóstico de la historia mal escrita

La historia de ejemplo (*"Como desarrollador quiero crear la tabla usuarios"*) está mal escrita porque es una **tarea disfrazada de historia**: describe un paso técnico interno (crear una tabla), no un incremento de valor observable para alguien. Nadie fuera del equipo de desarrollo "quiere" una tabla — el beneficio real estaría un nivel más arriba (por ejemplo, poder registrar usuarios en el sistema). Se reescribiría como: *"Como usuario quiero poder registrarme en el sistema para acceder a mis tareas"*, y "crear la tabla usuarios" pasaría a ser una de sus tareas técnicas, no la historia en sí.

### Problemas encontrados y cómo los resolví

1. **La tabla del Project apareció colapsada.** Al asignar el campo Sprint, solo se veían la épica y el bug como filas — la historia y las tareas estaban anidadas y ocultas bajo la épica. Se resolvió expandiendo la fila de la épica con la flecha desplegable, lo que reveló las sub-filas.

2. **Se asignó por error el Sprint a la épica y al bug.** La consigna solo pide sprint para la historia y sus tareas. Se corrigió vaciando el campo Sprint en esos dos issues.

### Uso de IA

Usé Claude para interpretar la consigna del TP3 (jerarquía épica/historia/tarea, sprint, límite de WIP, trazabilidad), para guiarme paso a paso por la interfaz de GitHub Projects (que no había usado antes), y para redactar el contenido de los issues (épica, historia con criterios de aceptación, tareas, bug). Verifiqué cada paso ejecutándolo yo misma en GitHub y confirmando visualmente el resultado (jerarquía navegable, sprint asignado, PR cerrando la tarea) antes de avanzar.

## TP4 — CI: Pipelines as Code

### Estructura del pipeline

El workflow tiene dos jobs, `build-backend` y `build-frontend`, que corren en paralelo porque son completamente independientes entre sí (cada uno construye su propia imagen con su propio Dockerfile del TP2). Separarlos en dos jobs, en vez de uno solo secuencial, reduce el tiempo total de la corrida y aísla el fallo: si el backend rompe, se ve exactamente en qué job y no hace falta esperar a que termine el otro para saberlo.

### Cache

El pipeline cachea las capas de Docker de cada imagen (`cache-from`/`cache-to: type=gha`), con un `scope` distinto por job (`backend` y `frontend`) para que no se pisen entre sí. En la segunda corrida sobre el mismo PR, las cuatro capas del backend (`WORKDIR`, `COPY package*.json`, `RUN npm ci`, `COPY . .`) se reutilizaron completas (`CACHED` en el log), sin reconstruir nada. Si el cache desaparece (la plataforma no garantiza que persista), el pipeline sigue funcionando igual, solo que reconstruye todo desde cero — más lento, pero no roto.

### Por qué el pipeline construye con el Dockerfile en vez de compilar por su cuenta

El pipeline usa `docker build` sobre los mismos Dockerfiles del TP2, en vez de correr `npm install`/`npm run build` directamente en el runner. Esto evita tener dos definiciones distintas de cómo se construye la app (una para CI, otra para producción) que con el tiempo podrían divergir — lo que el pipeline verifica es exactamente lo mismo que después se despliega, no una aproximación.

### Problemas encontrados y cómo los resolví

1. **Al principio no distinguía las distintas corridas históricas del workflow en la pestaña Actions** (una por cada PR anterior, incluyendo el `ci.yml` esqueleto del TP3). Se resolvió identificando la corrida correcta por su mensaje de commit y el número de PR asociado, en vez de mirar solo la lista general.

2. **El primer intento de romper el build tuvo un error de sintaxis JSON** (faltó una coma al agregar la dependencia inexistente en `package.json`), lo que habría roto el build por un motivo distinto al buscado (JSON inválido, no dependencia inexistente). Se corrigió agregando la coma en el lugar correcto antes de confirmar que el fallo fuera el esperado (`npm ci` fallando por no encontrar el paquete).

### Uso de IA

Usé Claude para interpretar la consigna del TP4, para escribir el `ci.yml` completo (los dos jobs, el cache, el orden de los pasos), y para guiarme en la configuración del gate de protección de rama (status checks requeridos) y en la demostración del PR roto → bloqueado → arreglado → verde. Verifiqué cada paso mirando yo misma los resultados en GitHub (el log del cache con `CACHED`, el check rojo bloqueando el merge, el badge renderizado en el README) antes de avanzar al siguiente.