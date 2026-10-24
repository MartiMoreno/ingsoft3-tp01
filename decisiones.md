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

---

## TP5 — Calidad automatizada: tests, coverage y el umbral que frena un merge

### Qué lógica elegí testear y por qué

Hasta el TP4 el backend no tenía reglas propias: las rutas de `index.js` mandaban los datos directo a PostgreSQL, y si algo era inválido lo frenaban los CHECK de la base con un error 500. En el frontend, los filtros, las fechas y las llamadas a la API estaban dentro de los componentes de `App.jsx`. No había nada que un test pudiera llamar, así que primero refactoricé:

- **Backend:** `src/validaciones.js` (funciones puras: título obligatorio y de hasta 200 caracteres, prioridad, estado, fecha límite opcional y válida, id entero positivo), `src/tareasServicio.js` (valida antes de guardar y pasa solo los campos permitidos) y `src/tareasRepo.js` (el mismo SQL de antes, pero recibiendo el `pool` por parámetro). `index.js` quedó como arranque y rutas que solo piden, delegan y responden.
- **Frontend:** `src/lib/tareas.js` con `filtrarTareas`, `textoVencimiento`, `estadoVencimiento` y las llamadas a la API, que reciben el cliente HTTP (`traer`) por parámetro.

Elegí esa lógica porque es donde más duele un bug en esta app: en lo que se guarda en la base (datos inválidos) y en lo que ve el usuario (filtros y fechas).

**Suites:** backend con 24 tests (35 casos) sobre 5 reglas distintas, y frontend con 13 tests (19 casos). Las tres técnicas están en los dos lados:
- **Parametrizado** (`it.each`): títulos vacíos, prioridades válidas, fechas vacías e ids inválidos en el backend; combinaciones de filtros y fechas vacías en el frontend.
- **Casos de error y de borde:** título de 200 caracteres aceptado y de 201 rechazado, fecha inexistente (`2026-02-30`), fecha que no es texto, id inválido; y en el frontend, que `crearTarea` lance el mensaje que manda el backend cuando rechaza una tarea.
- **Mock:** ver la sección siguiente.

El criterio que usé para saber si un test vale: si invierto la regla, algún test se tiene que poner en rojo. Lo probé a mano (ver "Por qué coverage alto no garantiza calidad").

### Refactor para poder mockear

Antes, el `pool` de PostgreSQL estaba importado fijo dentro de las rutas, y los `fetch` del frontend estaban dentro de los componentes: no había forma de reemplazarlos desde un test. Ahora la dependencia entra desde afuera (inyección de dependencias): `crearRepositorioTareas(pool)`, `crearServicioTareas(repo)` y `crearTarea(datos, traer)`. En la app se les pasa el `pool` y el `fetch` reales; en los tests, un doble hecho con `vi.fn()`.

Tests con mock (el assert verifica cómo se usó la dependencia):
- Backend: crear una tarea válida llama a `repo.crear` **una sola vez** y con los datos ya normalizados; con título vacío o prioridad inválida se lanza `ErrorValidacion` y `repo.crear` **no se llama**. En el repo, `pool.query` se llama con el `INSERT` y los parámetros en el orden correcto.
- Frontend: `crearTarea` llama a `traer` una vez con `POST`, el header y el body en JSON; `borrarTarea` llama con `DELETE` a `/api/tareas/7`.

En la misma suite hay dobles usados como **stub** (el assert mira el valor devuelto, no la llamada): "si `repo.actualizar` devuelve `null`, el servicio devuelve `null`" (para que la ruta responda 404) y "`listarTareas` devuelve el JSON de la respuesta". Es el mismo `vi.fn()`: lo que cambia es el assert.

### Reglas que agregué y bugs que aparecieron

1. **Datos inválidos se guardaban o terminaban en 500.** Antes del refactor, un título vacío (`""` o solo espacios) se guardaba igual: la columna solo exige `NOT NULL`, y para PostgreSQL un texto vacío no es `NULL` (el `required` del formulario frena el campo vacío, pero no `" "`). Un título faltante o una prioridad inválida terminaban en 500 por el `NOT NULL` o el `CHECK`. Ahora el servicio valida todo eso y responde 400 con un mensaje claro. Lo verifiqué con un pedido directo a la API: `{"titulo":""}` → 400 `{"error":"El título es obligatorio."}`.
2. **Fecha vacía.** El formulario manda `fecha_limite: ""` y PostgreSQL no acepta `""` como fecha. Ahora se normaliza a `null` (tarea sin fecha).
3. **La fecha se mostraba un día antes.** Una tarea cargada para el 23/10 decía "Vence 22/10". La base devuelve `2026-10-23T00:00:00.000Z` (medianoche UTC) y el navegador lo convertía a hora argentina (UTC-3), o sea al 22 a las 21 hs. El bug estaba desde el TP2, con el pipeline en verde, porque compilaba y no había ningún test de fechas. Ahora `textoVencimiento` arma el texto a partir del string, sin `new Date`, y un test lo cubre.
4. **El frontend volvía a la lista aunque el backend hubiera rechazado la tarea.** Ahora el formulario muestra el mensaje de error.
5. Prioridad obligatoria al crear y estado obligatorio al editar (la base ya los exigía como `NOT NULL`, pero el error era un 500).

### Cobertura: qué dejé afuera de la cuenta y por qué

- **Backend:** `include: ['src/**']`. Quedan afuera `index.js` (arranque y rutas que solo delegan al servicio) y `db.js` (solo configura la conexión, sin reglas).
- **Frontend:** `include: ['src/lib/**']`. Quedan afuera `App.jsx` y `main.jsx` (componentes de pantalla; la interfaz completa se verifica end-to-end en el TP7).

Primero saqué la lógica a esas carpetas y recién después dejé el resto afuera, para no esconder lógica sin testear. Y al medir por carpeta, cualquier archivo nuevo que se agregue ahí entra solo a la cuenta, aunque no tenga tests: es lo que demuestra el PR #24.

Cobertura visible en el Summary de la corrida y reporte descargable como artefacto (`coverage-backend` y `coverage-frontend`): https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40058456013

### Umbral

**80 % de líneas y 80 % de ramas, en backend y frontend** (`coverage.thresholds` de vitest), sobre el total de cada lado. PR: https://github.com/MartiMoreno/ingsoft3-tp01/pull/22

- **Por qué 80:** cuando lo elegí medía 88,88 % de líneas y 93,61 % de ramas en el backend, y 88,88 % y 88,23 % en el frontend. 80 deja unos 8 puntos de margen: un cambio chico no da un rojo falso, pero una función nueva sin tests lo hace caer.
- **Por qué las dos métricas:** la de rama es la más honesta (un `if` probado solo por un lado da 100 % de líneas y 50 % de ramas). Y con umbral solo de ramas, una función nueva sin ningún `if` no restaría nada.
- **Rama hoy:** 93,61 % en el backend y 92,59 % en el frontend.
- **Sobre el total y no por archivo:** hoy `tareasRepo.js` está en 60 % de líneas porque `listar` y `borrar` no tienen tests; con un umbral por archivo, el backend no pasaría.
- **Para subirlo a 90** tendría que testear `listar` y `borrar` del repositorio y del servicio.

### El ejercicio de la rama sin cubrir

1. **Qué línea es:** `backend/src/validaciones.js`, línea 42, en `validarFechaLimite`: `if (typeof fecha !== 'string')`. El reporte la marcaba con una `I`: nunca se entraba al `if`, porque todos los tests pasaban texto, vacío o `null`.
2. **Qué entrada la recorre:** una fecha que llegue como número, por ejemplo `20261020`. Desde el formulario no pasa, pero la API está abierta y este JSON es válido: `{"titulo":"x","prioridad":"MEDIA","fecha_limite":20261020}`.
3. **Qué decidí:** agregar el test ("rechaza una fecha límite que no es texto"), porque es una entrada posible desde afuera y tiene que dar 400, no 500. Las ramas del backend pasaron de 91,48 % a 93,61 %. En cambio, la otra rama sin cubrir del mismo archivo (línea 67, el id que llega como número) no la cubrí: el id siempre llega como texto desde la URL, así que en esta app ese camino no ocurre.

### Por qué coverage alto no garantiza calidad (mi ejemplo)

Hice un mutante a mano: en la regla del largo del título cambié `>` por `>=`. La app compilaba igual y la cobertura no cambiaba (se ejecutan exactamente las mismas líneas), pero el test de borde "acepta un título de exactamente 200 caracteres" se puso en rojo (33 de 34 casos; lo hice antes de agregar el test de la fecha que no es texto, por eso son 34 y no 35). Lo detectó un assert sobre el borde, no el porcentaje. Un test que llama a `validarTitulo` sin ningún `expect` sumaría la misma cobertura y no lo detectaría. Por eso la cobertura baja es una señal confiable de que falta algo, pero la alta no prueba que esté verificado.

### Los Pull Requests bloqueados por cobertura

**PR 1, la secuencia completa:** https://github.com/MartiMoreno/ingsoft3-tp01/pull/23

Agregué `estadoVencimiento` en el frontend, sin tests. Compilaba y los 14 tests existentes pasaban, pero se puso en rojo el check `build-frontend`, en el paso "Correr los tests con coverage", por **las dos métricas** (con vitest 5.0.5, las ramas de una función que nunca se ejecuta también cuentan):

    ERROR: Coverage for lines (66.66%) does not meet global threshold (80%)
    ERROR: Coverage for branches (55.55%) does not meet global threshold (80%)

Corrida roja: https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40068242201/job/120795904556

`build-backend` siguió en verde: el freno salta solo donde está el código sin tests. Lo arreglé con un test por cada camino que declara la función (sin fecha, completada, vencida, vence hoy, a tiempo), con `hoy` fijo por parámetro para que no dependan del reloj. El check pasó a verde y lo mergeé.

Corrida verde: https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40100677606/job/120892003513

**PR 2, el freno vigente (queda abierto y en rojo hasta la defensa):** https://github.com/MartiMoreno/ingsoft3-tp01/pull/24

Agrega un archivo nuevo al backend, `src/resumen.js`, sin tests. Aunque nadie lo importa, entra a la cuenta por el `include`, y `build-backend` queda en rojo por líneas y ramas, con todos los tests en verde.

Este freno es distinto del del TP4: allá solo bloqueaba si algo no compilaba; ahora bloquea un cambio que compila y pasa todos los tests, por un criterio de calidad que elegí yo. Lo que sigue sin detectar es un test mal pensado: si entendí mal un requisito, el test lo congela mal y queda en verde. Eso solo lo ve alguien que sepa qué se quiso pedir, en la revisión del Pull Request.

### Herramientas (mi stack no es el de la cátedra)

La app es Node/Express + React/Vite, así que usé vitest en los dos lados:

| Lo que pide la guía | Lo que usé |
|---|---|
| Dónde viven los tests | Al lado del código: `backend/src/*.test.js` y `frontend/src/lib/*.test.js` |
| Test parametrizado | `it.each` |
| Que la dependencia entre desde afuera | Parámetro de la función: `pool`, `repo` y `traer` |
| Fabricar el doble | `vi.fn()` |
| Medir la cobertura | `vitest run --coverage` con `@vitest/coverage-v8` |
| Umbral que rompe el build | `coverage.thresholds` |
| Qué entra en la cuenta | `coverage.include` |
| Herramientas de test en la etapa `test` del Dockerfile | `npm ci` sin `--omit=dev` en la etapa `build`; la imagen final sigue con `--omit=dev` |

### Problemas encontrados y cómo los resolví

1. **Node 20 no alcanzaba.** Vitest 5 exige Node 22.12 o más, y los Dockerfiles usaban `node:20-alpine` (que además dejó de tener soporte en abril de 2026). Los pasé a `node:22-alpine`.
2. **El Dockerfile del backend tenía una sola etapa con `npm ci --omit=dev`,** así que vitest no entraba a la imagen. Lo pasé a tres etapas (`build` → `test` → `final`), con la de producción última y sin herramientas de testing.
3. **El script `test:ci` no anda en Windows:** la expansión `${COVERAGE_DIR:-coverage}` es de `sh` y npm en Windows usa `cmd.exe`. En mi compu corro `npx vitest run --coverage`, y `test:ci` queda para el contenedor, que es Linux.
4. **OneDrive bloqueaba carpetas internas de `.git`** al renombrar ramas y al cambiar de rama ("Deletion of directory ... failed"). No afectó los commits: era una carpeta vacía que Git no podía borrar.

### Uso de IA

Usé Claude (chat) para entender el marco teórico, planificar los pasos siguiendo la guía y armar los prompts. Usé Claude Code para escribir el refactor, los tests, la configuración de cobertura y el umbral, los Dockerfiles y los pasos del `ci.yml`, con la regla de no hacer commits ni tocar archivos fuera de cada paso; las ramas, los commits y los Pull Requests los hice yo. También me ayudó a redactar esta sección a partir de lo que fui haciendo. Lo verifiqué así: corrí los tests y la cobertura en mi compu y dentro de Docker; probé la app en el navegador (la fecha corregida, crear, editar y borrar) y con un pedido directo a la API; hice un mutante a mano para comprobar que los tests detectan una regla invertida; abrí el reporte de cobertura para el ejercicio de la rama sin cubrir; y revisé las corridas del pipeline (el Summary, los artefactos y la corrida roja por umbral). Para cada test puedo explicar qué verifica su assert y qué cambio en el código lo pondría en rojo; lo que hoy no está cubierto es `listar` y `borrar` del repositorio y del servicio.
