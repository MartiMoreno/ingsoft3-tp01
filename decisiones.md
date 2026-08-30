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