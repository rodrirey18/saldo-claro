# Saldo Claro · v4

Maqueta funcional de control de finanzas personales, priorizando la experiencia en celulares.

**No necesita Laravel, React, Node.js, servicios de pago ni base de datos.** Funciona como sitio estático, ideal para GitHub Pages. HTML, CSS y JavaScript están separados.

## Carpetas

```text
SaldoClaro_v3/
├── index.html                   Entrada de la app
├── README.md                    Esta guía
└── assets/
    ├── css/
    │   ├── app.css              Diseño general, tarjetas y formularios
    │   └── welcome.css          Bienvenida, bloqueo y guía interactiva
    ├── js/
    │   ├── icons.js             Íconos SVG personalizados
    │   ├── security.js          Cifrado AES-GCM y gestión de contraseña local
    │   ├── data.js              Datos, almacenamiento y cálculos
    │   ├── views.js             Pantallas y formularios
    │   ├── actions.js           Registrar, editar y eliminar operaciones
    │   ├── app.js               Eventos y navegación
    │   └── welcome.js           Primer ingreso, desbloqueo y tutorial
    └── icons/
        ├── icon.svg             Favicon
        └── apple-touch-icon.png Icono al añadir a pantalla de inicio de iPhone
```

## Abrir en Visual Studio Code

1. Descomprime el ZIP. Abre Visual Studio Code → **Archivo → Abrir carpeta** → selecciona `SaldoClaro_v3`.
2. En **Extensiones**, instala **Live Server** (Ritwick Dey) si aún no lo tienes.
3. Haz clic derecho sobre `index.html` → **Open with Live Server**.
4. La dirección será algo como `http://127.0.0.1:5500/`. Esto permite probar también las opciones de contraseña.
5. La primera vez, escribe un nombre si quieres; también puedes establecer una contraseña (opcional). Sigue la guía interactiva o pulsa *Saltar guía*.

> No se recomienda ejecutar la aplicación directamente mediante `file://` para probar Web Crypto: sus permisos y almacenamiento pueden variar entre navegadores. Usa Live Server o GitHub Pages.

## Subir esta versión a tu repositorio GitHub

Repositorio ya creado: `https://github.com/rodrirey18/saldo-claro`

**Forma sencilla desde la web de GitHub:**

1. Entra al repositorio → **Code → Add file → Upload files**.
2. Desde el explorador de Windows, arrastra **`index.html`, `README.md` y la carpeta `assets` completa** (que contiene `css`, `js` e `icons`). Debes conservar los nombres de carpeta tal como aparecen arriba. Si ya había un `index.html`, confirma el reemplazo al hacer el commit.
3. Pulsa **Commit changes** y espera el resultado.
4. En **Settings → Pages**, selecciona **Deploy from a branch**, rama **main**, carpeta **/(root)** y pulsa **Save**.
5. Abre `https://rodrirey18.github.io/saldo-claro/`. La publicación puede tardar varios minutos.

**Opción con Git desde VS Code (para actualizaciones futuras):**

```bash
git clone https://github.com/rodrirey18/saldo-claro.git
cd saldo-claro
```

Después copia **el contenido de** `SaldoClaro_v3/` dentro de la carpeta clonada `saldo-claro/`, reemplazando los archivos antiguos, y ejecuta:

```bash
git add .
git commit -m "Organizar proyecto y añadir bienvenida y tutorial"
git push origin main
```

Si no has configurado Git, puede pedirte autenticarte con GitHub. No copies la carpeta completa dentro de otra carpeta, ya que `index.html` debe quedar en la raíz del repositorio.

## Cambios de esta versión

- Estilos (`app.css`, `welcome.css`) y lógica JavaScript fuera del HTML.
- Bienvenida al primer ingreso con nombre opcional y contraseña opcional.
- Guía tipo videojuego con 9 pasos, resaltado de áreas, Atrás / Siguiente / Saltar.
- En **Ajustes → Privacidad**, puedes activar, cambiar o eliminar la contraseña, bloquear inmediatamente y repetir la guía.
- Si hay contraseña, los datos se cifran en almacenamiento del navegador con **AES-GCM**, usando clave derivada con **PBKDF2-SHA256**. Los datos existentes se migran al activar la contraseña.
- Compatible con los registros, metas y presupuestos de la versión HTML anterior (mismo formato local).
- Ícono propio para navegadores y pantalla de inicio de iPhone.
- **Nuevo en v4:** cada meta tiene su propio botón **«Mi plan para alcanzar esta meta»** para registrar hábitos a reducir, alternativas más económicas y planes de ahorro.
- Se pueden crear, editar, pausar y eliminar estrategias. Para cada una se introduce cuánto costaba y cuánto costaría después, por semana o por mes.
- Se calcula el **ahorro mensual potencial** y el tiempo aproximado necesario para completar la meta usando únicamente esas estrategias activas.
- Lista de gastos pequeños del mes (límite seleccionable 10, 20 o 30 unidades monetarias), sin presuponer que todos son innecesarios.
- Botón para **registrar un aporte real** a una meta por separado. Ningún posible ahorro aumenta automáticamente los saldos.
- Se mantiene el modelo de datos v3 (`schema: 2`) y se agrega `strategies: []` compatible con datos viejos.

## Cómo usar el nuevo plan para una meta

1. Abre **Metas** y crea una (por ejemplo, un curso o una laptop).
2. Pulsa **«Mi plan para alcanzar esta meta»**.
3. Elige una sugerencia (gastos hormiga, marcas más económicas, suscripciones) o crea tu propia idea.
4. Rellena cuánto gastas **ahora** y cuánto gastarías **después**, e indica si es por semana o por mes.
5. La pantalla muestra lo que **podrías ahorrar**. Por ejemplo, de S/ 40 a S/ 25 por semana supone `(40 - 25) × 52 ÷ 12 = S/ 65 al mes` de ahorro potencial.
6. Cuando realmente tengas dinero disponible y quieras separarlo, pulsa **«Registrar ahorro real para esta meta»**, selecciona la cuenta y registra el aporte.

**Importante:** las recomendaciones son educativas y editables, no determinan qué gastos son innecesarios. Evita recortar necesidades fundamentales. El ahorro potencial no es dinero ya ahorrado; un cambio en el plan no modifica los saldos, ingresos ni egresos reales.

## Datos y seguridad: límites importantes

Este sitio **no tiene cuentas de usuario ni backend**. El nombre es un apodo local, NO un usuario registrado. Los datos no se envían ni sincronizan a ningún servidor y solo se almacenan en el navegador y dominio donde se use. Si alguien abre la app en otro teléfono, **no verá automáticamente** tus datos.

- **Sin contraseña:** el contenido local se almacena **sin cifrar**; alguien con acceso al mismo perfil de navegador podría consultarlo.
- **Con contraseña:** los datos del navegador se cifran en reposo y la aplicación pide la contraseña al abrirse. Sin conocerla no puede descifrarse fácilmente el archivo local, pero esto no reemplaza un sistema de autenticación en servidor ni garantiza protección frente a dispositivos infectados.
- **Contraseña olvidada:** no existe recuperación. Se debe borrar el espacio cifrado o restaurar un respaldo previamente guardado. El botón *Borrar este espacio y empezar de cero* elimina los datos protegidos.
- **Exportar JSON:** el respaldo exportado **no está cifrado**. Guárdalo de forma privada.
- **Borrar datos del navegador:** puede eliminar los registros. Haz respaldos periódicos.
- **GitHub público:** cualquiera puede ver el código fuente. **No subas archivos JSON de respaldo ni datos personales al repositorio.**
- Para acceder a los mismos datos desde diferentes dispositivos o para crear cuentas separadas en un mismo navegador, se necesitará un backend (por ejemplo Laravel + base de datos + autenticación) en una fase posterior.

## Cómo añadir funcionalidades

- Aspecto, tarjetas y colores: `assets/css/app.css`.
- Diseño de planes de ahorro por hábitos: `assets/css/coach.css`.
- Bienvenida y recorrido: `assets/css/welcome.css` y `assets/js/welcome.js`.
- Pantallas y textos: `assets/js/views.js`.
- Estrategias de ahorro, cálculo potencial y revisión de gastos pequeños: `assets/js/coach.js`.
- Reglas de ingresos, gastos, ahorros y transferencias: `assets/js/data.js`.
- Registro, edición, borrado e importación: `assets/js/actions.js`.
- Privacidad local y cifrado: `assets/js/security.js`.

Desarrollado como prototipo de aprendizaje y pruebas. No sustituye asesoramiento financiero profesional.
