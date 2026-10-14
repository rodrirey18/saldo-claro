# Saldo Claro v6 — Maqueta móvil

App de finanzas personales (HTML, CSS y JavaScript, sin dependencias externas). Puedes publicarla gratis en GitHub Pages. Los registros se guardan **localmente en el navegador**: no hay cuentas, contraseñas nuevas, sincronización con otros dispositivos ni conexión bancaria.

## Cambios frente a v5

- La **guía tipo cómic conserva el mismo diseño**. Mientras un paso está abierto, la página no se mueve con el desplazamiento manual. Al pulsar **Siguiente** la app centra el nuevo elemento señalado.
- La bienvenida ahora pregunta **solo cómo quieres que te llamen**; el nombre es opcional. Se retiró la opción de crear una contraseña y sus botones en Ajustes.
- **Compatibilidad con v5 cifrada:** si habías activado contraseña en v5, tendrás que introducirla **una última vez** para descifrar y pasar tus registros a almacenamiento local **sin contraseña**. La recuperación anterior permanece disponible exclusivamente para esa migración. No borres los datos del navegador antes de exportar una copia.
- Añadimos **Configurar sueldo**: un solo ingreso a fin de mes o dos ingresos (día 15 y último día). Se introduce el **total mensual** y la app divide automáticamente si eliges dos pagos.
- Añadimos **ingresos y gastos fijos mensuales** (servicios, alquiler, suscripciones, etc.): título, importe, fecha, canal y categoría. Puedes editar o eliminar reglas.
- El resumen y la sección **Metas → Plan mensual** muestran la **proyección del mes:** ingresos fijos − gastos fijos = dinero previsto para gastos variables, ahorro u otros usos.
- Opción **Registrar automáticamente al llegar la fecha**: cuando abres o regresas a la app y el día de cobro/pago ya llegó, añade una anotación al libro. No duplica el mismo compromiso en el mismo mes. Si eliminas una de estas anotaciones, no se vuelve a crear en ese mes.
- Los movimientos automáticos son **suposiciones basadas en lo programado**, ya que Saldo Claro NO conoce tus cuentas bancarias. **Comprueba cada pago e ingreso real** y edítalo si el importe o la fecha cambió. Puedes desmarcar la opción para llevar solo la proyección y registrar el movimiento real manualmente.
- Los meses futuros mantienen su **proyección**, pero no se registra dinero como recibido o gastado antes de su fecha. Las reglas nuevas comienzan en el mes en que las guardas, no modifican el historial anterior.

## Archivos

```
SaldoClaro_v6/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   ├── app.css
    │   ├── coach.css
    │   └── welcome.css
    ├── icons/
    │   ├── apple-touch-icon.png
    │   └── icon.svg
    └── js/
        ├── icons.js
        ├── security.js       # Solo compatibilidad/migración de datos cifrados v5
        ├── data.js
        ├── recurring.js      # Nuevo: cálculo y reglas fijas
        ├── views.js
        ├── coach.js
        ├── actions.js
        ├── app.js
        └── welcome.js
```

## Probar en Visual Studio Code

1. Extrae el ZIP en una carpeta.
2. Ábrela en Visual Studio Code (**Archivo → Abrir carpeta**).
3. Abre `index.html` con la extensión **Live Server**, o abre el archivo con Chrome para probarlo localmente. Se recomienda Live Server para la prueba real del sitio.

## Actualizar tu GitHub SIN usar Git en VS Code

1. Antes de actualizar, abre tu página actual y ve a **Ajustes → Exportar** para guardar un respaldo JSON en un lugar privado. NO subas ese JSON a GitHub.
2. Abre https://github.com/rodrirey18/saldo-claro
3. Elige **Add file → Upload files**.
4. En el Explorador de Windows, abre la carpeta extraída y **arrastra `index.html`, `README.md` y la carpeta `assets/`**, juntos, al cuadro grande de GitHub; NO arrastres el ZIP.
5. Comprueba que los archivos dentro de `assets/js/`, `assets/css/` y `assets/icons/` se muestran correctamente y pulsa **Commit changes**.
6. Si tienes **Settings → Pages** configurado con **main** y **/(root)**, espera a que termine la publicación y visita https://rodrirey18.github.io/saldo-claro/.
7. Recarga la página en el navegador para cargar los archivos nuevos. En caso de que siga apareciendo la versión anterior, prueba una pestaña privada SIN importar datos personales.

### Seguridad y límites

- Los registros se almacenan en `localStorage`, sin contraseña. Cualquier persona que use el mismo perfil del navegador puede verlos. No representa un producto listo para datos financieros sensibles.
- Si limpias datos del navegador o cambias de dispositivo, se perderán los registros salvo que exportes y luego importes el respaldo JSON.
- Los movimientos fijos automáticos son **anotaciones estimadas**, no cargos bancarios reales. Compruébalos antes de tomar decisiones económicas.
- Puedes cambiar el importe de cualquier anotación automática en **Movimientos** si el cargo fue distinto al previsto.

## Comprobaciones realizadas

Probado en navegador Chromium con interfaz de 390 y 320 px: primer ingreso, guía que no se desplaza, sueldo en dos pagos, regla fija de gasto, proyección de S/ 1,000 - S/ 400 = S/ 600, prevención de cargos duplicados, eliminación de anotación automática, perfil y Ajustes. No se realizó en esta sesión una prueba real en Safari de iPhone ni la migración completa de una cuenta cifrada v5 desde su dispositivo original.
