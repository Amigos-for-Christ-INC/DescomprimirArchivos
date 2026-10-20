# Descompresor AFC

Herramienta interna de Amigos for Christ para abrir y crear archivos comprimidos desde el navegador, sin instalar WinRAR, 7-Zip ni otros programas.

## Qué hace

**Extraer**
- Formatos: ZIP, RAR, 7Z, TAR, GZ, TGZ, BZ2, XZ, ISO, CAB y otros que soporta libarchive.
- Archivos con contraseña.
- Buscar dentro del contenido y elegir qué archivos sacar.
- "Extraer en una carpeta…" guarda todo con su estructura de carpetas (Edge y Chrome).
- Descarga individual de cada archivo (todos los navegadores).
- Avisa cuando el comprimido trae ejecutables o documentos con macros (.exe, .bat, .js, .docm, etc.).
- Limpia rutas peligrosas (`../`, rutas absolutas) para que un archivo malicioso no escriba fuera de la carpeta elegida.

**Comprimir**
- Junta archivos y carpetas en un .ZIP (compresión rápida, normal o máxima).
- No vuelve a comprimir archivos que ya vienen comprimidos (fotos, PDF, Office), así es más rápido.

## Privacidad

Todo se procesa dentro del navegador de cada persona. Los archivos no se suben a ningún servidor.

## Publicarlo

Es un sitio estático. Necesita servirse desde un servidor web (no funciona abriendo `index.html` con doble clic, porque el navegador bloquea los módulos y workers en `file://`).

Con GitHub Pages:
1. Suba esta carpeta completa a un repositorio, por ejemplo `Amigos-for-Christ-INC/Descompresor-AFC`.
2. En el repositorio: Settings → Pages → Branch `main`, carpeta `/ (root)` → Save.
3. Comparta el enlace `https://amigos-for-christ-inc.github.io/Descompresor-AFC/` con el personal.

Para probarlo localmente: `python -m http.server 8080` dentro de la carpeta y abrir `http://localhost:8080`.

## Contenido

| Ruta | Qué es |
|---|---|
| `index.html` | La aplicación |
| `lib/libarchive.js`, `lib/worker-bundle.js`, `lib/libarchive.wasm` | libarchive.js 2.0.2 (MIT) para leer los formatos |
| `lib/fflate.min.js` | fflate 0.8.2 (MIT) para crear ZIP |
| `fonts/Raleway-Variable.woff2` | Tipografía de la marca (OFL) |
| `img/` | Logos oficiales 2021 |

No depende de ningún servicio externo: todas las librerías van incluidas en la carpeta.

## Limitaciones

- Crear archivos con contraseña o en formato RAR/7Z no está incluido; solo crea ZIP sin contraseña.
- Todo se carga en memoria: con comprimidos de varios GB puede quedarse corto en equipos con poca RAM.
- "Extraer en una carpeta" solo existe en Edge y Chrome. En Firefox se descarga archivo por archivo (hasta 15 a la vez).
