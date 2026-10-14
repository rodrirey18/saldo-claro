# Saldo Claro — Maqueta de finanzas personales

Maqueta web **mobile-first** creada con HTML, CSS y JavaScript, sin dependencias externas.

## Abrir en Visual Studio Code

1. Descarga y descomprime `SaldoClaro_para_GitHub.zip`.
2. Abre Visual Studio Code.
3. Selecciona **Archivo > Abrir carpeta** y elige la carpeta `SaldoClaro_para_GitHub`.
4. Abre `index.html` para ver o modificar el código.
5. Para probarla, abre `index.html` en Chrome/Edge o usa la extensión **Live Server** de VS Code (opcional: clic derecho > Open with Live Server).

## Publicar gratis en GitHub Pages

1. Crea un repositorio público llamado `saldo-claro` (o el nombre que prefieras) en https://github.com/new.
2. Sube los archivos **`index.html`, `README.md` y `.nojekyll`** a la raíz del repositorio en la rama `main` (Code > Add file > Upload files > Commit changes).
3. En el repositorio, abre **Settings > Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige **main**, carpeta **/(root)** y pulsa **Save**.
6. Al publicarse, aparecerá un botón **Visit site**. Para un repositorio llamado `saldo-claro`, la URL normalmente será `https://TU_USUARIO.github.io/saldo-claro/`.

También puedes publicar el repositorio desde VS Code con Source Control > Publish Branch si tienes Git instalado y vinculaste GitHub.

## Importante: datos y privacidad

- Los datos quedan almacenados **localmente en el navegador** del dispositivo (localStorage).
- No hay cuentas, login ni sincronización entre dispositivos.
- Los datos que añadas no se suben automáticamente a GitHub. Subir la **carpeta del código** no equivale a subir tus registros locales.
- Alguien que utilice el mismo navegador/perfil puede acceder a los registros; **no es una app de finanzas segura para uso real compartido**.
- Borrar datos del navegador o usar otro dispositivo puede hacer que no aparezcan tus registros: realiza respaldos JSON desde Ajustes.
- La web publicada es pública; no incluyas claves ni información privada en archivos del repositorio.

## Estructura

```
SaldoClaro_para_GitHub/
├── index.html  # Aplicación completa
├── README.md   # Esta guía
└── .nojekyll   # Publicación directa de archivos estáticos
```

> No es necesario instalar Node.js ni ejecutar npm para esta versión.
