# Enlaces del TP7

| Qué | Enlace |
|---|---|
| Paquete público del backend (etiqueta sha-f886f46e20ed9b8ee5af390c40ff18cbf1017bbd, la imagen del arreglo que llegó a PROD) | https://github.com/MartiMoreno/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend |
| Paquete público del frontend (misma etiqueta) | https://github.com/MartiMoreno/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend |
| Commit que rompió la app (PR #35: el front manda title en vez de titulo) | https://github.com/MartiMoreno/ingsoft3-tp01/commit/32052b12c18d81fd5c351e815a421f6737f8096b |
| Corrida con la integración VERDE y la e2e ROJA (deploy-prod no arrancó) | https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40333632337 |
| Reporte de esa corrida: playwright-report-integracion (verde) | https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40333632337/artifacts/12655471995 |
| Reporte de esa corrida: playwright-report-e2e (rojo) | https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40333632337/artifacts/12655492796 |
| Corrida completa en verde posterior, hasta PROD (PR #36, el arreglo) | https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40335863668 |
| QA (front) | https://marti-tareas-front-qa.onrender.com |
| PROD (front) | https://marti-tareas-front-prod.onrender.com |

Bajar una imagen sin credenciales: `docker pull ghcr.io/martimoreno/ingsoft3-tp01-backend:sha-f886f46e20ed9b8ee5af390c40ff18cbf1017bbd` (y lo mismo con `-frontend`).

Los reportes son artefactos de Actions: se ven estando logueado en GitHub y vencen a los 7 días (retention-days: 7 de la guía). La corrida, con sus logs, sigue en el enlace de arriba.

# Enlaces de este TP (TP6)

| Qué | Enlace |
|---|---|
| Paquete público del backend (etiquetado con el commit de un merge: sha-7fd369d6d1cb7e39be43035e451cdabf36ac8418) | https://github.com/MartiMoreno/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend |
| Paquete público del frontend (mismo tag) | https://github.com/MartiMoreno/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend |
| Cadena 1: job de un PR con los tests en verde donde «Entrar al registry» sale salteado (sólo main publica) | https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40126811641/job/120969902561 |
| Cadena 2: corrida de main donde «Construir y publicar la imagen» es el último paso, después de los tests | https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40127189068/job/120971016042 |
| QA (front) | https://marti-tareas-front-qa.onrender.com |
| PROD (front) | https://marti-tareas-front-prod.onrender.com |

Para bajar las imágenes sin credenciales: `docker pull ghcr.io/martimoreno/ingsoft3-tp01-backend:sha-7fd369d6d1cb7e39be43035e451cdabf36ac8418` (y lo mismo con `-frontend`).

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

## TP6 — CD: environments, aprobaciones y deployment patterns

### Proveedor y cómo cumplo el contrato

Usé **Render** para correr la app y **Neon** para la base. No usé el Postgres de Render porque su plan gratuito expira a los 30 días; el de Neon es permanente (con límites). Los cinco puntos del contrato:
1. **Dos entornos separados**, cada uno con su URL pública: cuatro Web Services en Render (`marti-tareas-api-qa`, `marti-tareas-front-qa`, `marti-tareas-api-prod`, `marti-tareas-front-prod`), región Virginia.
2. **Una base por entorno:** `app_qa` y `app_prod` en Neon, región `us-east-1` (la misma zona que Render). Lo comprobé insertando una tarea «SOY PROD» sólo en `app_prod` desde el SQL Editor: aparece en el front de PROD y no en el de QA.
3. **Front y back como contenedores**, construidos con mis Dockerfiles (runtime Docker en los cuatro servicios).
4. **El deploy lo dispara el pipeline** con el commit verificado: Auto-Deploy en Off en los cuatro servicios y deploy hooks llamados con `&ref=$GITHUB_SHA`.
5. **Producción detrás de la aprobación** del environment `production` de GitHub.

### El artefacto: por qué se publica sólo con la verificación en verde

Cada job publica su imagen en `ghcr.io`, etiquetada con el commit (`sha-…`), y sólo en un push a `main`. La garantía de que en el registry sólo hay cosas verificadas sale de tres eslabones encadenados: (1) nada entra a `main` sin el pipeline en verde (los checks obligatorios del TP4 y el umbral de cobertura del TP5); (2) sólo `main` publica (el `push:` del paso exige `event_name == 'push'` y `ref == 'refs/heads/main'`, así que en los PRs la imagen se construye pero no se sube); (3) publicar es el **último paso del mismo job que corre los tests**, sin `!cancelled()` ni `always()`: si los tests fallan, el job se corta y nunca llega a publicar. No hay ningún `if` que diga «si los tests pasaron»: la condición es el orden de los pasos.

Si se publicara igual con los tests en rojo, estar en el registry dejaría de significar «esto pasó la verificación», y desplegar desde ahí sería desplegar cualquier cosa que alguien construyó alguna vez. Lo que la cadena **no** impide es que alguien suba una imagen a mano con `docker push`: garantiza lo que publica el pipeline, no lo que físicamente puede entrar.

Detalles: los nombres van escritos a mano en minúsculas (`ghcr.io/martimoreno/ingsoft3-tp01-backend` y `-frontend`), porque mi usuario tiene mayúsculas y ghcr.io no las acepta; no reusé los paquetes `mi-backend`/`mi-frontend` del TP2 porque los creé a mano con mi usuario y el `GITHUB_TOKEN` del pipeline no puede escribir en ellos. El permiso `packages: write` está dentro de cada job y no a nivel del workflow (mínimo privilegio), y el login usa el `GITHUB_TOKEN` de la corrida, así que no hizo falta ningún secret nuevo. Los paquetes son públicos para que cualquiera los baje sin credenciales.

### Continuous Delivery vs Continuous Deployment

Implementé **Continuous Delivery**: cada cambio integrado llega solo a QA, y a producción sólo con una aprobación humana. No hice Continuous Deployment porque mi red de seguridad todavía no alcanza para sacar al humano: el smoke test prueba que el entorno contesta pero no qué versión corre, y no tengo métricas de errores ni de uso. Con esa red, automatizar el último paso sería automatizar la propagación de errores.

### La cadena (needs / if / environments) y el alcance de cada secret

`build-backend` y `build-frontend` → `deploy-qa` (`needs` de los dos builds, `if: github.ref == 'refs/heads/main'`, `environment: qa`) → `deploy-prod` (`needs: deploy-qa`, `environment: production`, `concurrency: deploy-prod`). En los PRs los dos deploys salen salteados: `deploy-prod` no repite el `if` porque depende de `deploy-qa`, que ya lo tiene. La pausa antes de PROD no está en el YAML: la pone la regla *Required reviewers* del environment `production`.

Los deploy hooks de Render son secrets (quien tiene la URL despliega el servicio) y viven en el alcance de su entorno: `RENDER_HOOK_API_QA` y `RENDER_HOOK_FRONT_QA` en el environment `qa`; `RENDER_HOOK_API_PROD` y `RENDER_HOOK_FRONT_PROD` en `production`. Ninguno está en los secrets del repositorio: si estuvieran ahí, cualquier job (también el de un PR abierto desde una rama de este repo; a los PRs que vienen de un fork GitHub no les pasa secrets) podría leer los de producción y desplegar a PROD sin pasar por la aprobación. Así, a los de PROD sólo los lee un job aprobado.

Los hooks se llaman con `&ref=$GITHUB_SHA` (con `&` porque la URL ya trae `?key=`): Render despliega **el commit que el pipeline verificó**, no la punta de la rama. Sin eso, con dos merges seguidos la corrida del primero desplegaría el segundo, y en PROD se subiría algo distinto de lo que aprobé.

### Configuración afuera de la imagen

La dirección del backend ya no está escrita en el front: el `nginx.conf` pasó a ser una plantilla (`frontend/default.conf.template`) que la imagen oficial de nginx procesa al arrancar, reemplazando `${BACKEND_URL}` y `${DNS_RESOLVER}`. **Quedó por variable:** la URL del backend de cada entorno, el DNS y, en el backend, la conexión a la base (`DATABASE_URL`). **Quedó adentro de la imagen:** el build de Vite, la plantilla y los valores por defecto de Compose (`http://backend:3001` y `127.0.0.11`), así que `docker compose up` sigue andando igual. Lo probé en mi máquina: la misma imagen sin variables apunta a `backend:3001` y con variables apunta a la api de QA. Es lo que va a permitir en el TP7 desplegar la misma imagen en QA y en PROD.

Para correr en la nube también agregué al backend un `GET /health`, la lectura de `DATABASE_URL` (Neon exige SSL) manteniendo las variables `DB_*` de Compose, y un `CREATE TABLE IF NOT EXISTS` al arrancar (si falla, el proceso termina con error en vez de quedar «Live» sin base). Eso también resolvió el problema del TP2 de crear la tabla a mano.

### Qué mira mi aprobador antes de aprobar

1. Que `deploy-qa` de esa corrida haya terminado en verde.
2. Que en Render los dos servicios de QA muestren **el mismo commit** que voy a aprobar, en estado Live. No me alcanza con el smoke (ver más abajo).
3. Que el cambio se vea en el front de QA y la lista cargue.
4. Saber qué cambia ese deploy (el PR que lo originó).

Lo que mi aprobador **no** puede ver: cómo se comporta la versión con usuarios reales, errores o tiempos de respuesta. Me falta observabilidad para decidir mejor.

**Rechazo:** https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40260913560 (merge del PR #29). El smoke de QA pasó en el primer intento, segundos después del hook, mientras Render todavía estaba construyendo ese commit: ese verde lo dio la versión anterior, así que no tenía evidencia de que QA corriera lo que iba a subir. Rechacé y PROD no se tocó.

**Aprobaciones:** https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40264357559 (PR #30, el título pasa a «Mis tareas») y https://github.com/MartiMoreno/ingsoft3-tp01/actions/runs/40320651805 (PR #31, «Mis tareas (versión nueva)»). En las dos esperé a ver QA Live con el commit en Render y el título nuevo en pantalla antes de aprobar.

### Qué prueba mi smoke test y qué no

Reintenta hasta 30 veces cada 20 segundos (por el build de Render y el cold start) y comprueba tres cosas: `/health` (el proceso está vivo), `/api/tareas` (la base responde: un `/health` solo daría verde con la conexión rota) y el front. Si no responde a tiempo, el job falla. **No prueba qué versión corre:** el hook responde al instante, Render construye en segundo plano y mientras tanto sirve la versión anterior, así que el smoke puede dar verde contra la versión vieja. Me pasó en los deploys del #28 y del #29 (verde en la primera vuelta). La mitigación sería que `/health` devuelva el commit y el smoke lo compare con `github.sha`.

### Qué garantía pierdo porque Render reconstruye

Render no corre la imagen que publicó mi pipeline: vuelve a construir el mismo commit desde el repositorio. Promuevo el mismo **commit**, pero no la misma **imagen** que pasó los tests. Puede salir distinto si entre un build y otro cambió algo de afuera: una versión nueva de la imagen base (`node:22-alpine`, `nginx:alpine`) o algo del entorno de build. Eso rompe «se despliega lo mismo que se verificó», y es lo que resuelve el TP7 haciendo que Render ejecute la imagen del registry.

### La letra chica del free tier

- Render duerme cada servicio a los ~15 minutos sin tráfico y el primer pedido tarda hasta ~1 minuto en despertarlo: por eso el smoke reintenta en vez de hacer un `curl` seco.
- Las 750 horas por mes son del workspace, no de cada servicio, y los minutos de build son 500 por mes. Al cerrar el TP llevaba 6,62 h y 3 min. No dejo nada haciendo ping para que no duerma, porque se comería las horas. Si se acabaran los minutos de build, el hook respondería igual y el smoke daría verde contra la versión vieja.
- Neon suspende la base a los ~5 minutos sin uso (se despierta sola, rápido) y tiene 0,5 GB.

### Deployment pattern para una producción real

Usaría **blue-green**. Es una app chica, así que tener dos entornos completos (el doble de infraestructura) es barato, y a cambio el rollback es instantáneo: se vuelve a mandar el tráfico al entorno anterior, en vez de esperar a que se levante el commit viejo como hoy. **Canary** no lo podría hacer en serio todavía: necesita métricas que digan si la versión nueva está fallando (errores, latencia) y hoy no tengo observabilidad. El cuidado con blue-green es la base, que comparten los dos entornos: un cambio de esquema tiene que ser compatible con las dos versiones mientras conviven.

### Plan de rollback (medido)

Si un deploy aprobado sale mal: (1) busco el commit del último deploy bueno (el tag de la release anterior o *Deployments → production*); (2) copio los dos deploy hooks de PROD desde Render (los secrets de GitHub no se pueden volver a leer); (3) los llamo con `&ref=<ese sha>`; (4) espero a que los dos servicios estén Live en *Deploys* de Render y compruebo el front.

Lo hice de verdad el 26/10/2026: PROD estaba en el PR #31 («Mis tareas (versión nueva)») y volví a `v6.0.0` (PR #30). Disparo 09:22:54; API: inicio 09:23:15, Live 09:23:36; front: inicio 09:23:21, Live 09:23:43. **49 segundos** desde el disparo hasta el último Live (las horas están en *Deploys* de cada servicio de PROD en Render). PROD volvió a «Mis tareas» y la tarea «SOY PROD» siguió ahí.

Lo que este rollback **no** deshace: los datos y los cambios de esquema (si un deploy hubiera borrado una columna, volver el código no la recupera). Además, `main` y QA siguen teniendo el #31: el próximo deploy aprobado lo volvería a subir, así que en un equipo real después del rollback haría un PR que lo revierta. Y como lo disparé a mano, el rollback aparece en Render pero no en *Deployments* de GitHub. Métrica DORA que ejercita: el tiempo de recuperación.

### Release

`v6.0.0` marca el commit `3bb848b` (PR #30), el que estaba en PROD cuando la etiqueté (lo verifiqué en *Deployments → production*), no la punta de `main`. La release tiene las notas generadas desde los PRs.

### Herramientas (mi stack no es el de la cátedra)

| Lo que pide la guía | Lo que usé |
|---|---|
| Publicar la imagen | `docker/build-push-action` → `ghcr.io` |
| Sólo main publica | `push: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}` |
| Etiquetar con el commit | `:sha-${{ github.sha }}` |
| Entornos y gate humano | environments `qa` y `production` de GitHub, required reviewer |
| Deploy disparado por el pipeline, del commit verificado | deploy hooks de Render con `&ref=$GITHUB_SHA` |
| Conexión por el entorno | `DATABASE_URL` (URI de Neon) |
| Crear el esquema | `CREATE TABLE IF NOT EXISTS` al arrancar el backend |
| Endpoint de vida / que toca la base | `/health` · `/api/tareas` |
| Dirección del backend en el front | `BACKEND_URL` en la plantilla de nginx (puerto 3001) |

### Problemas encontrados y cómo los resolví

1. **`Cannot GET /health` al probar el backend contra Neon desde mi máquina:** el contenedor de Compose seguía levantado y ocupaba el puerto 3001 con la versión vieja. Lo resolví con `docker compose down` (sin `-v`, para no perder datos) antes de arrancar el backend.
2. **El primer intento de rollback no fue un rollback:** PROD ya estaba en `v6.0.0`, así que redesplegué la misma versión (39 s). Lo rehice subiendo primero un cambio nuevo (el #31) y volviendo de ahí.
3. **Expuse un deploy hook:** al hacer el rollback pegué el hook de la api de PROD donde iba el texto del `Read-Host`, y quedó a la vista. Lo regeneré en Render y actualicé el secret `RENDER_HOOK_API_PROD`.
4. **OneDrive bloqueaba carpetas internas de `.git`** al cambiar de rama, igual que en el TP5. No afectó los commits.

### Uso de IA

Usé Claude (chat) para entender el marco teórico, adaptar la guía a mi app (Node/Express en vez de .NET: puerto 3001, `DATABASE_URL`, la tabla al arrancar) y armar los prompts. Usé Claude Code para escribir los cambios del `ci.yml` (publicar la imagen, `deploy-qa` y `deploy-prod`), la plantilla de nginx, el `/health`, la conexión a Neon y los cambios de texto del front, con la regla de no hacer commits ni tocar otros archivos. También me ayudó a redactar esta sección a partir de lo que fui haciendo. Las cuentas de Neon y Render, los environments, los secrets, las ramas, los commits, los PRs, las aprobaciones, el rechazo, el tag, la release y el rollback los hice yo. Lo verifiqué así: probé el backend contra la base de QA desde mi máquina y la plantilla con dos `docker run`; miré en cada corrida qué pasos corrían y cuáles salían salteados; comprobé en Render que cada deploy fuera del commit correcto; probé los entornos en el navegador; hice la prueba de «SOY PROD» para las bases, y cronometré el rollback con las horas de Render. Lo que pasa entre el merge y PROD es: CI verde → `deploy-qa` (hooks de QA con el commit y smoke) → `deploy-prod` en pausa hasta mi aprobación → hooks de PROD con el mismo commit y smoke.

## TP7 — Contenedores en el pipeline + integración y e2e

### Build once, deploy many

En el TP6 Render reconstruía la app desde el repositorio en cada deploy: lo que corría en QA y en PROD no era la imagen que mi pipeline verificó, sino otra construcción del mismo commit. Aunque el código fuera idéntico, esa reconstrucción podía salir distinta: por ejemplo, si entre un build y otro se actualizaba la imagen base (`node:22-alpine` o `nginx:alpine`), PROD podía terminar corriendo algo que nadie probó. Ahora la unidad de release es **la imagen**: se construye una sola vez, en el job que corre los tests, y QA y PROD ejecutan exactamente esa misma imagen. Lo que se prueba es lo que se despliega.

### Etiquetas: sha-<commit>, v7.0.0 y por qué no latest

- **`sha-<commit>`** (en el registry): identifica la imagen que produjo y verificó la corrida de ese commit. Es lo que el pipeline le manda a Render en cada deploy. Va con los 40 caracteres: el registry no completa un commit corto.
- **`v7.0.0`** (en git): le pone nombre al commit que está en PROD al cerrar el práctico. Es el punto al que volvería.
- **No publico `latest`**: se mueve de una imagen a otra y no dice qué hay adentro. Un deploy que dijera `latest` ejecutaría «lo último que se publicó», haya pasado las pruebas o no.
- `sha-<commit>` se podría volver a publicar (por ejemplo, re-corriendo la corrida de ese commit); lo que no cambia nunca es el **digest** (`@sha256:…`), la huella del contenido. Según la guía de la cátedra (§2.4), el `imgURL` de Render también acepta el digest en lugar del tag; no lo probé.

En Render **les cambié la fuente** a los cuatro servicios existentes (de repositorio a *Existing Image*), no creé servicios nuevos, así que se conservaron las URLs, las variables y los deploy hooks. Los configuré con la imagen `sha-ff4bab1…` (el merge del #32), que es sólo el punto de partida: lo que corre cada vez lo nombra el `imgURL` de cada deploy del pipeline. Por eso no toco *Manual Deploy* en Render: desplegaría la imagen de *Settings*, no la última verificada.

### De la release a la imagen, en un paso

`git rev-list -n1 v7.0.0` me da el commit, y las dos imágenes de ese commit están en los paquetes como `sha-<ese commit>` (backend y frontend con la misma etiqueta). Volver a esa versión es mandarle esa imagen al deploy hook de PROD.

### Cómo se comprueba desde afuera que el entorno ejecuta mi imagen

En los *Events* de cada servicio de Render, el deploy dice «Triggered via Deploy Hook» y nombra la imagen `ingsoft3-tp01-backend:sha-<commit>` o `ingsoft3-tp01-frontend:sha-<commit>` de esa corrida, y esa misma etiqueta está en mis paquetes. El smoke no alcanza para esto: sólo pregunta si el entorno responde, y si un deploy falla, el servicio sigue sirviendo la versión anterior y el smoke da verde igual.

### Qué pruebo en integración y qué en e2e

**Integración** (`frontend/e2e/api.spec.js`, con el `request` de Playwright, sin navegador y sin dobles), contra la api de QA:
1. Alta + verificación + borrado: `POST` → la lista de la base lo trae → `DELETE` → ya no está.
2. Alta inválida: título vacío → `400`, y la cantidad de tareas no cambió.
3. (la elegí yo) Cambiar el estado queda guardado: `POST` → `PUT` con `COMPLETADA` → la base lo devuelve completado → borrado. Es lo que más se usa después de crear, y pasa por el `CHECK` de estados de la base.

**e2e** (`frontend/e2e/tareas.spec.js`, navegador real), contra el front de QA:
1. Crear una tarea la muestra en la lista, y eliminarla la saca.
2. Un título de más de 200 caracteres muestra el error (que menciona el 200) y no crea nada.
3. (lo elegí yo) Cambiar el estado de una tarea queda guardado: es lo que un usuario hace todos los días (marcar lo que terminó), y si deja de andar es lo primero que se nota.

Todas fabrican un título único con la hora y borran lo que crean, comprobándolo, porque QA es uno solo y lo comparten todas las corridas. Para que un «no aparece» no pase sólo porque la lista todavía estaba cargando, las e2e esperan la respuesta de `GET /api/tareas` antes de afirmarlo.

**Qué no puse en cada suite (pirámide):** cada regla de validación con todos sus bordes ya la cubren los unitarios del TP5, que son rápidos; repetirlas con un navegador sería lento y frágil. En integración no pruebo la pantalla, y en e2e no repito lo que la integración ya probó de la api: la e2e se queda con lo que nadie más ve, cómo el front usa la api. Tampoco puse en e2e los filtros de la lista: es lógica pura del front, cubierta por unitarios.

Para que Playwright encuentre los elementos como una persona (por su etiqueta y su rol), al front le agregué `label` asociados a los campos (`htmlFor`/`id`) y `role="alert"` en el mensaje de error.

### El par verde/rojo que diagnosticó la rotura

En el PR #35 rompí **la aplicación**, no un test: el formulario mandaba `title` en vez de `titulo`. Compilaba y los unitarios pasaban (`App.jsx` no tiene unitarios). En la corrida, el smoke quedó verde, la **integración verde** y la **e2e roja**, y `deploy-prod` no arrancó. La lectura: la integración le habló a la api con el nombre correcto y la base guardó y borró sin problema, así que la api y la base estaban sanas; la e2e falló al usar el formulario, así que el roto era el front. Lo confirmé con el reporte de la e2e: fallaron los tres flujos. En los dos que crean una tarea, la captura mostraba el formulario con «El título es obligatorio.» y la tarea nunca apareció en la lista; en el del título largo, el cartel apareció pero decía «El título es obligatorio.» en vez de mencionar el límite de 200, porque el título ni le llegaba a la api. Si hubiera roto la api, la integración habría quedado roja y la e2e ni habría corrido (su `needs` no se cumple). El arreglo (PR #36) pasó toda la cadena en verde, lo aprobé y llegó a PROD con la misma imagen que verificó QA.

Lo que este gate no ataja: un requisito mal entendido (si la prueba congela la idea equivocada, queda en verde), y los problemas que sólo aparecen con carga o con usuarios reales.

### Por qué mi integración es la amplia

Mi integración le habla a la api **ya desplegada en QA**, con su base de verdad. La alternativa era la estrecha: levantar la api y un Postgres descartable dentro del job. **Gana** que prueba exactamente la imagen que corre en QA y con casi nada de configuración extra. **Pierde** que llega más tarde (necesita el deploy) y que depende de que QA esté vivo y no lo esté usando otra corrida.

### Cold start, timeouts y tests flaky

El plan gratis de Render duerme los servicios. El smoke del job `deploy-qa` los despierta antes de que corran las suites, y Playwright tiene topes generosos: 60 s por test y 15 s por aserción, con un reintento. No uso `sleep` ni salteo tests si el entorno no responde. Un test **flaky** es uno que a veces pasa y a veces falla sin que cambie el código. Es peor que no tener test, porque entrena a ignorar el rojo. Un test que pasa recién en el reintento aparece como *flaky* en el reporte aunque la corrida quede verde, por eso abro el reporte igual.

### La misma imagen del front en QA y en PROD

La dirección del backend no está dentro de la imagen: la plantilla de nginx del TP6 la lee de `BACKEND_URL` al arrancar. La imagen `ingsoft3-tp01-frontend:sha-…` es la misma en los dos entornos, y lo único que cambia son sus variables en Render (`BACKEND_URL` con la api de su entorno y `DNS_RESOLVER`). Adentro de la imagen quedan el build de Vite, la plantilla y los valores por defecto de Compose.

### Límites conocidos

- **QA es uno solo:** con dos merges seguidos, la corrida B podría redesplegar QA mientras las suites de la A lo usan. Lo reconocería mirando en Events qué imagen corría en QA y a qué hora corrió el `deploy-qa` de B. Por eso hago un merge por vez. Un equipo real tendría un entorno por corrida.
- **El smoke puede dar verde contra la versión anterior** mientras Render todavía levanta la nueva. Antes de aprobar miro en Events que QA tenga la imagen de esa corrida.

### Problemas encontrados y cómo los resolví

1. **Los labels del formulario no estaban asociados a sus campos**, así que `getByLabel` no los encontraba. Agregué `htmlFor`/`id` y `role="alert"` en el error.
2. **Vitest levantaría los specs de Playwright** (los dos usan archivos `.spec.js`) y rompería el job de build. Lo resolví con `exclude: [...configDefaults.exclude, 'e2e/**']` en `vite.config.js`.
3. **OneDrive bloqueó la carpeta `frontend/e2e`** al cambiar a un `main` viejo. Respondí que no y el `git pull` la restauró.

### Uso de IA

Usé Claude (chat) para entender la consigna y adaptarla a mi app (Node/Express, puerto 3001, mis pantallas y endpoints) y para armar los prompts. Usé Claude Code para escribir el cambio de los deploys a `imgURL`, los jobs `integracion` y `e2e`, los dos specs, la configuración de Playwright, los labels del front, la rotura a propósito y su arreglo; también me ayudó a redactar esta sección. Los cambios de fuente en Render, las ramas, los commits, los PRs y las aprobaciones los hice yo. Lo verifiqué así: probé el deploy de una imagen a mano en un servicio antes de cambiar el pipeline; miré en Events de Render que cada deploy nombrara la imagen `sha-` de su corrida; corrí las dos suites local contra Docker Compose antes de subirlas; leí los logs (3 passed en cada suite) y diagnostiqué la rotura con el reporte de la e2e. Cada test verifica lo que dice su nombre contra QA desplegado; si uno falla, la cadena se corta y PROD no pide aprobación.

## TP8 — Infraestructura como código

### Riel y versiones

Riel Terraform + Neon + Render, el de la materia. Terraform 1.16.6, con los providers fijados en `infra/main.tf`: `kislerdm/neon` **0.18.0** y `render-oss/render` **1.9.1** (el `.terraform.lock.hcl`, que se commitea, fija además sus hashes). `infra/` declara un entorno nuevo, `preprod`: un proyecto de Neon propio (`ingsoft3-tp01-preprod`, con su rol y su base `app_preprod`) y dos servicios de Render (`marti-tareas-api-preprod` y `marti-tareas-front-preprod`) que corren la imagen de `v7.0.0`. QA y producción no se tocan: no están declarados, y por eso ningún `plan` los ve.

Ninguna credencial está en el HCL: los providers leen `NEON_API_KEY`, `RENDER_API_KEY` y `RENDER_OWNER_ID` del entorno, y el id de la organización de Neon entra por `TF_VAR_neon_org_id`. La cadena de conexión de la api se arma en un `local` con el host, el rol, la contraseña y la base que devuelve Neon, y la `BACKEND_URL` del front sale de la `url` de la api de preprod (sin barra final): las dos cosas que en el TP6 se copiaban a mano ahora se derivan. El estado (`terraform.tfstate`) vive en mi máquina y está en el `.gitignore` desde antes del primer apply, porque adentro tiene la contraseña del rol en texto plano.

### Problemas encontrados y cómo los resolví

1. **`terraform` no se reconocía después de instalarlo con winget:** la terminal no tenía el PATH actualizado. Lo recargué en la sesión.
2. **Neon pidió `org_id` para crear el proyecto** (`org_id is required`): las cuentas de Neon ahora funcionan por organización y la guía se midió antes de ese cambio. Agregué la variable `neon_org_id` y la paso por `TF_VAR_neon_org_id`, para no escribir el id en el repo.
3. **Render rechazó el owner id** (`invalid ownerID`): había usado el `usr-…` de mi usuario, y Render espera el `tea-…` del workspace. Lo saqué de *Workspace Settings*. Como Neon ya se había creado en ese apply, el siguiente plan propuso crear sólo los dos servicios: el estado recordaba lo que ya existía.
4. Usé `region_id = "aws-us-east-1"` en Neon y `virginia` en Render, para que la base y los servicios queden en la misma zona, igual que QA y PROD.

Hice el ciclo `apply` → `destroy` → `apply` → `destroy`: preprod respondió en `/health` y `/api/tareas` y el front cargó contra su api; el segundo `plan` dio «No changes»; y el destroy borró primero el front, después la api, y por último la base, el rol y el proyecto (el grafo de dependencias al revés). QA y producción siguieron intactos. Queda destruido: tiene que poder nacer en la defensa.

### Uso de IA

Usé Claude (chat) para entender la consigna y adaptarla a mi app (la conexión como URI para `DATABASE_URL`, el puerto 3001, la región) y para diagnosticar los errores de `org_id` y de owner id. Claude Code escribió los archivos de `infra/` y esta sección. Las llaves, los `init`, `plan`, `apply` y `destroy`, y las comprobaciones en las consolas de Neon y Render las hice yo. Lo verifiqué leyendo cada plan antes de aplicarlo (qué se crea, qué queda `known after apply`, la última línea), con los `curl` a preprod, con el segundo `plan` en «No changes» y mirando el orden del destroy.
