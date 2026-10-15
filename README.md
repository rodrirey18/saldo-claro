# Saldo Claro v8 — App de finanzas personales

Proyecto web **mobile-first**, organizado en HTML, CSS y JavaScript. Funciona en GitHub Pages, Android, iPhone y en el navegador de la computadora. Es una maqueta funcional que guarda datos en el navegador **sin cuentas en servidor ni sincronización entre dispositivos**.

## Mejoras de v8

1. **Bienvenida en dos pasos:** primero el nombre o apodo (opcional); después digital, efectivo y ahorros iniciales (también opcionales). Puedes tocar **«Lo haré más tarde»**. El segundo paso es el dinero que **ya tienes**, no el sueldo futuro.
2. **Saldo arrastrado entre meses:** en Inicio se muestran el saldo digital, efectivo y ahorros al *comenzar* el mes seleccionado, el total disponible al empezar y cómo cambió con ingresos cobrados, gastos, ahorros y diferencias sin identificar. El dinero sobrante **permanece disponible**, sin contarlo de nuevo como ingreso del mes siguiente.
3. **Nombres más claros para los respaldos:** en Ajustes, «Exportar» pasa a **Guardar copia** e «Importar» pasa a **Recuperar copia**. Se mantiene el formato JSON y las mismas acciones.
4. **Centro de ayuda actualizado:** añade explicaciones sobre saldos iniciales opcionales y dinero sobrante de meses anteriores. Se abre desde el `?` del encabezado.

## Importante: saldos reales y previstos

- **Saldo disponible:** dinero digital + efectivo actual calculado; no incluye ahorros separados.
- **Saldo anterior:** dinero que tenías al empezar el mes, desglosado por bolsillo. No crea movimientos ni ingresos duplicados.
- **Ingresos del mes:** dinero cobrado y registrado, no el sueldo que todavía esperas.
- **Gastos del mes:** gastos registrados. Una transferencia digital ↔ efectivo no es gasto ni ingreso.
- **Ahorros:** separados de lo disponible. Aportar ahorros no es un gasto.
- **Cálculo mensual previsto:** sueldo fijo programado menos gastos fijos configurados. No implica que los cobros o pagos ocurrieron de verdad; las anotaciones automáticas solo son registros basados en fechas programadas.
- **Dinero que no cuadra:** «Comprobar mi dinero» puede registrar una diferencia sin identificar. No se inventa su categoría.

Para los usuarios que ya tienen información desde v7, **no vuelve a aparecer la bienvenida**. Se conservan sus registros en el mismo navegador. Los datos antiguos sin fecha de inicio explícita muestran «Dinero acumulado al iniciar el mes» por claridad.

## Estructura

```text
saldo-claro/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   ├── app.css
    │   ├── coach.css
    │   ├── welcome.css
    │   └── help.css
    ├── icons/
    │   ├── icon.svg
    │   └── apple-touch-icon.png
    └── js/
        ├── icons.js
        ├── security.js
        ├── data.js
        ├── recurring.js
        ├── views.js
        ├── coach.js
        ├── reconcile.js
        ├── help.js
        ├── actions.js
        ├── app.js
        └── welcome.js
```

## Probar en Visual Studio Code

Abre la carpeta extraída en VS Code y pulsa **Open with Live Server** sobre `index.html`. No requiere instalar dependencias. Puedes probar el tutorial en la sección de ayuda del encabezado.

## Reemplazar la versión de GitHub desde la web

1. En la versión que ya utilizas, entra a **Ajustes → Copias de seguridad** (en v7: Ajustes → Tus datos → Exportar) y **guarda una copia** de tus datos antes de actualizar.
2. Descomprime `SaldoClaro_v8_codigo_completo.zip`.
3. Entra a [tu repositorio](https://github.com/rodrirey18/saldo-claro) → **Code → Add file → Upload files**.
4. Arrastra `index.html`, `README.md` y **toda la carpeta `assets`** (conservando `css/`, `js/` e `icons/`).
5. Pulsa **Commit changes** en `main`. Después, revisa **Actions** hasta que GitHub Pages termine la publicación.
6. Abre <https://rodrirey18.github.io/saldo-claro/> y recarga la página. Si continúa una versión antigua, prueba actualizar sin caché.

La app no se actualizará en GitHub al guardar cambios en VS Code: la publicación requiere subir los archivos y confirmarlos en el repositorio.

## Privacidad y respaldo

El archivo JSON contiene datos financieros sin cifrar. No lo publiques en GitHub ni lo compartas por WhatsApp. Guárdalo de forma privada. Los datos no se sincronizan entre celulares; la copia permite transferirlos manualmente. GitHub Pages **publica el código**, no los registros guardados en el `localStorage` de cada navegador.

> La app no se conecta a bancos y no verifica cobros; la exactitud de los saldos depende de lo que registre cada persona.
