# Concurso R. F. 2026 — formulario web

Dos archivos:

| Archivo | Dónde va |
|---|---|
| `index.html` | GitHub (la página que se abre en el celular) |
| `Codigo.gs` | Apps Script, dentro de la planilla de Google |

El orden importa: **primero Apps Script**, porque de ahí sale una dirección que hay que pegar en `index.html`.

---

## Parte 1 — Habilitar Apps Script en la planilla

1. Abrí la planilla **concurso biblico** en Google Sheets.
2. Menú **Extensiones → Apps Script**. Se abre una pestaña nueva.
3. Borrá todo lo que aparezca en el editor (suele decir `function myFunction() {}`) y **pegá el contenido completo de `Codigo.gs`**.
4. Arriba a la izquierda, donde dice *Proyecto sin título*, ponele un nombre: `Concurso R. F. 2026`.
5. Guardá con el ícono del disquete (o `Ctrl+S`).

### Dar los permisos

6. En la lista de funciones (arriba, al lado del botón *Ejecutar*) elegí **`probar`** y tocá **Ejecutar**.
7. Google va a pedir permisos:
   - **Revisar permisos** → elegí tu cuenta de Google.
   - Va a aparecer *"Google no verificó esta aplicación"*. Es normal: la aplicación la estás haciendo vos.
     Tocá **Configuración avanzada** → **Ir a Concurso R. F. 2026 (no seguro)** → **Permitir**.
8. Si salió bien, en la planilla aparece una hoja nueva **AGOSTO** con una fila de prueba.
   **Borrá esa fila de prueba** (dice `PRUEBA BORRAR`).

### Publicar como aplicación web

9. Arriba a la derecha: **Implementar → Nueva implementación**.
10. Tocá el engranaje ⚙ al lado de *Seleccionar tipo* y elegí **Aplicación web**.
11. Completá así:
    - **Descripción:** `Formulario Concurso RF 2026`
    - **Ejecutar como:** `Yo (tu correo)`
    - **Quién tiene acceso:** **`Cualquier usuario`** ← imprescindible, si no el formulario no puede escribir.
12. **Implementar** → **Autorizar acceso** si lo vuelve a pedir.
13. Copiá la **URL de la aplicación web**. Termina en `/exec` y se ve así:

    ```
    https://script.google.com/macros/s/AKfycb.....................M4/exec
    ```

> **Cada vez que cambies el `Codigo.gs`** tenés que ir a *Implementar → Administrar implementaciones → ✏️ editar → Versión: Nueva versión → Implementar*. Si no, sigue funcionando la versión vieja. La URL no cambia.

---

## Parte 2 — Pegar la dirección en el formulario

Abrí `index.html` con cualquier editor de texto y buscá, cerca del final, estas líneas:

```js
const CONFIG = {
  // ►►► PEGAR ACÁ la URL que termina en /exec que da Apps Script
  URL_APPS_SCRIPT: "",
```

Pegá la URL entre las comillas:

```js
  URL_APPS_SCRIPT: "https://script.google.com/macros/s/AKfycb.....M4/exec",
```

Guardá el archivo.

---

## Parte 3 — Subirlo a GitHub

### Si nunca usaste GitHub

1. Creá una cuenta gratis en <https://github.com>.
2. Arriba a la derecha, **+ → New repository**.
3. **Repository name:** `concurso-rf-2026`
4. Elegí **Public** y tocá **Create repository**.
5. En la pantalla que sigue tocá **uploading an existing file**.
6. Arrastrá `index.html` a la ventana.
7. Abajo, **Commit changes**.

### Encender la página

8. Dentro del repositorio: pestaña **Settings** → menú izquierdo **Pages**.
9. En *Source* elegí **Deploy from a branch**.
10. *Branch*: **main**, carpeta **/ (root)** → **Save**.
11. Esperá 1 o 2 minutos y refrescá. Arriba va a aparecer la dirección:

    ```
    https://TUUSUARIO.github.io/concurso-rf-2026/
    ```

Esa es la dirección que se comparte por WhatsApp. En el celular conviene abrirla y usar
**"Agregar a pantalla de inicio"** — queda como una aplicación.

### Para cambiar algo después

Entrá al repositorio → tocá `index.html` → el lápiz ✏️ → editás → **Commit changes**.
En 1 minuto se actualiza sola.

---

## Cómo escribe en la planilla

Cada envío crea una fila en la hoja del mes de la fecha elegida (**AGOSTO**, **SEPTIEMBRE**…).
Si la hoja no existe, la crea con los encabezados.

Las columnas **A a K son exactamente las mismas** que en MAYO y JUNIO, así que las fórmulas y
los conteos que ya tengas siguen funcionando. De la L en adelante se agrega lo nuevo:

| Col | Contenido |
|---|---|
| A | NOMBRE |
| B | ASISTENCIA (SI / NO) |
| C | PUNTUALIDAD (SI / NO) |
| D | LECTURA — capítulos |
| E | VERSICULOS — la cita del mes, automática |
| F | VERSOS — cuántos memorizó |
| G | INDICE — **cantidad de libros**, calculada de *desde* → *hasta* |
| H | FOLLETOS |
| I | INVITADA (1 / 0) |
| J | LECTURA DE LIBRO (1 / 0) |
| K | OTROS — libro y estado, ej. `MUJERES PIADOSAS — COMPLETO` |
| L | FECHA |
| M–N | INDICE DESDE / HASTA |
| O–P | LIBRO / ESTADO LIBRO |
| Q | FIRMA — enlace a la imagen |
| R | FIRMA (APELLIDO Y NOMBRE) |
| S | REGISTRADO — fecha y hora del envío |

Las firmas se guardan como PNG en una carpeta de tu Drive llamada
**Firmas Concurso R.F. 2026**. Por privacidad quedan visibles solo para vos
(`FIRMAS_PUBLICAS = false` en el `Codigo.gs`).

---

## Cosas que vas a querer cambiar

Todo está arriba de todo en cada archivo.

**En `index.html`:**

| Qué | Dónde |
|---|---|
| Máximo de capítulos (hoy 35) | `MAX_LECTURA` |
| Máximo de versículos (hoy 50) | `MAX_VERSICULOS` |
| Máximo de folletos (hoy 99) | `MAX_FOLLETOS` |
| Libros recomendados | `LIBROS_RECOMENDADOS` |
| Nombres de arranque | `NOMBRES_BASE` |
| Consigna de cada mes | `CRONOGRAMA` |
| Si el informe pasa a ser del mismo mes | `DESFASE_MES: 0` |

**En `Codigo.gs`:** `VERSICULOS_MES` (la cita que se escribe en la columna E) y
`FIRMAS_PUBLICAS`.

Los **nombres nuevos** que se agreguen desde el formulario quedan guardados en ese teléfono,
y además el formulario lee al abrirse todos los nombres que ya están en la planilla,
así que después de la primera carga aparecen en todos los dispositivos.

---

## Si algo no anda

| Pasa esto | Es por esto |
|---|---|
| Dice "No se pudo conectar" y guarda pendientes | Falta la URL, o la implementación no quedó en *Cualquier usuario*, o no hay señal. Los datos **no se pierden**: quedan en el teléfono y se envían con *Reintentar envío*. |
| Cambié el `Codigo.gs` y sigue igual | Falta *Nueva versión* en Administrar implementaciones. |
| No aparecen los nombres de la planilla | Revisá el ID en `ID_PLANILLA` y que la cuenta que autorizó tenga acceso de edición. |
| La firma no se dibuja | Hay que tocar dentro del recuadro punteado. En computadora se dibuja con el mouse. |
