# Descomprimir AFC — versión de escritorio (Windows)

App instalable que funciona **sin internet**. Usa exactamente la misma página de la raíz del repositorio, empaquetada con Electron.

## Qué agrega frente a la versión web
- Se instala con acceso directo en el escritorio y el menú Inicio (no requiere permisos de administrador).
- Aparece en «Abrir con…» para .zip, .rar, .7z, .tar, .gz, .tgz, .bz2 y .xz.
- «Extraer en una carpeta…» usa el diálogo normal de Windows y propone la carpeta donde está el comprimido.
- Una sola ventana: si ya está abierta, el nuevo archivo se abre en ella.

## Compilar
Requiere Node.js 20+ (y Wine si se compila desde Linux).

```
cd escritorio
mkdir app
cp -r ../index.html ../lib ../img ../fonts ../manifest.webmanifest app/
npm install
npm run dist
```

Genera en `dist/`:
- `Descomprimir-AFC-Instalador-1.0.0.exe` — instalador.
- `Descomprimir-AFC-Portable-1.0.0.exe` — se ejecuta sin instalar (útil en una USB).

Los .exe no se guardan en el repositorio porque pesan más de 100 MB.

## Nota sobre SmartScreen
El instalador no está firmado digitalmente. La primera vez Windows puede mostrar «Windows protegió su PC»: clic en **Más información → Ejecutar de todas formas**. Para evitarlo en toda la organización hay que firmarlo con un certificado de firma de código.
