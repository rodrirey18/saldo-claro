# Saldo Claro v7 — Proyecto para VS Code y GitHub Pages

Prototipo web para celular hecho con HTML, CSS y JavaScript, sin servicios externos ni instalaciones de paquetes. No tiene una cuenta en servidor; los registros se guardan en el navegador del dispositivo. **No es una conexión bancaria ni un servicio de almacenamiento seguro para terceros.**

## Novedades de v7

- **Sueldo fijo previsto vs. ingreso real:** el resumen de ingresos sigue mostrando solo cobros registrados. Los sueldos por confirmar aparecen ahora en Inicio con **«Ya lo recibí»**, que abre el formulario de registro real. Se conserva el cálculo mensual programado de v6.
- **¿Cuánto dinero tengo?:** «Comprobar mi dinero» permite escribir el dinero digital y efectivo que hay realmente. Si todavía no hay movimientos, guarda saldos iniciales. Si ya los hay, calcula y registra una **diferencia por identificar**, sin atribuirla a gastos o ingresos conocidos. Queda en Movimientos y se puede eliminar para sustituirla por la operación real si se descubre su causa.
- **Centro de ayuda y buscador:** signo `?` arriba a la derecha. Permite escribir `sueldo`, `gastos hormiga`, `Yape`, `dólares`, `saldo negativo`, etc. Muestra preguntas y funciones relacionadas, con acceso a la pantalla correspondiente. La guía tipo cómic continúa disponible allí; no se cambió su apariencia.
- **Menos duplicaciones:** quitados los accesos repetidos al tutorial en Ajustes y en Inicio. Ayuda detallada y buscador tienen un solo lugar. Se mantienen los accesos directos útiles para registrar gastos, ingresos y mover dinero.
- **Reconfigurar sueldo:** una regla de sueldo creada con el formulario **Mi sueldo fijo** se sustituye en una edición posterior del mismo formulario, en lugar de generar repetidos. Las reglas creadas en versiones antiguas sin ese identificador deben revisarse desde Plan mensual si estaban duplicadas.

## Organización

```text
saldo-claro/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   ├── app.css
    │   ├── coach.css
    │   ├── welcome.css
    │   └── help.css             # NUEVO
    ├── icons/
    │   ├── icon.svg
    │   └── apple-touch-icon.png
    └── js/
        ├── icons.js
        ├── security.js          # compatibilidad con datos v5
        ├── data.js
        ├── recurring.js
        ├── views.js
        ├── coach.js
        ├── help.js              # NUEVO
        ├── reconcile.js         # NUEVO
        ├── actions.js
        ├── app.js
        └── welcome.js
```

## Probarlo en Visual Studio Code

1. Extrae el ZIP y abre la carpeta en VS Code.
2. Instala **Live Server** si no lo tienes.
3. Haz clic derecho en `index.html` y selecciona **Open with Live Server**.
4. En el celular, después de publicarlo en GitHub Pages, prueba la bienvenida, confirma un sueldo programado, haz una comprobación de saldos y busca una respuesta en `?`.

## Actualizar la misma web desde GitHub (sin subir con VS Code)

1. Antes de actualizar, en la versión actual entra en **Ajustes → Tus datos → Exportar** y guarda un respaldo de tus datos reales si existen.
2. Abre **https://github.com/rodrirey18/saldo-claro**, pestaña **Code**.
3. Pulsa **Add file → Upload files**.
4. Arrastra **`index.html`**, **`README.md`** y **toda la carpeta `assets`** de la v7; conserva las subcarpetas. Esta versión añade `help.css`, `help.js` y `reconcile.js`, así que no basta con reemplazar el HTML.
5. Confirma **Commit changes** sobre la rama `main`.
6. En **Actions**, espera a que termine la publicación de Pages. Abre **https://rodrirey18.github.io/saldo-claro/** y actualiza la pestaña. Si conserva una copia vieja, recarga ignorando caché.

El repositorio debe seguir siendo **público** para usar GitHub Pages con GitHub Free. El código público NO significa que los registros guardados en el navegador se suban a GitHub: no se envían por defecto. No publiques archivos JSON con finanzas personales.

## Importante sobre balances

- **Previsto** = cálculo de ingresos y cargos configurados para el mes.
- **Ingreso real** = movimiento de dinero recibido registrado por el usuario, manualmente o por anotación automática en la fecha prevista. Una anotación automática **no comprueba** que el dinero haya llegado al banco.
- **Diferencia por identificar** = dinero faltante o sobrante comparado con lo contado; **no podemos saber en qué gastó la persona** sin más información. Se excluye de las categorías y de los totales de ingresos/gastos clasificados. Si se descubre la operación correcta, hay que **eliminar la diferencia correspondiente** y registrar el ingreso/gasto/transferencia real para no contar dos veces.
- Los saldos iniciales son anteriores a los movimientos. Cambiarlos después altera toda la historia, así que conviene usar **Comprobar mi dinero** para ajustar discrepancias posteriores.

## Seguridad y sincronización

Cada navegador almacena sus datos con `localStorage`. No hay contraseña en v7 ni cuentas remotas, sincronización, respaldo automático ni validación bancaria. Los datos pueden desaparecer si borras los datos del navegador. Exporta respaldos privados periódicamente. La versión no implementa pagos en moneda extranjera por movimiento.
