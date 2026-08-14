/**
 * ============================================================
 *  CONCURSO R. F. 2026 — recepción del formulario
 *  Se pega en: Planilla → Extensiones → Apps Script
 * ============================================================
 */

/* ---------- CONFIGURACIÓN ---------- */

// ID de la planilla "concurso biblico"
const ID_PLANILLA = '1VV2xF5Mv1iUO9xXygvFh_UwWccSLROPqAeP-YmXvEQ8';

// Carpeta de Drive donde se guardan las firmas (se crea sola la primera vez)
const CARPETA_FIRMAS = 'Firmas Concurso R.F. 2026';

// true  = cualquiera con el enlace puede ver la firma (se ve desde otras cuentas)
// false = solo quien tenga acceso a la carpeta (más privado). Recomendado: false.
const FIRMAS_PUBLICAS = false;

// Hojas que NO son de participantes
const HOJAS_EXCLUIDAS = ['CONCURSO'];

// Encabezados de las hojas nuevas.
// Las columnas A a K son iguales a MAYO y JUNIO, así no se rompe nada de lo anterior.
const ENCABEZADOS = [
  'NOMBRE','ASISTENCIA','PUNTUALIDAD','LECTURA','VERSICULOS','VERSOS','INDICE',
  'FOLLETOS','INVITADA','LECTURA DE LIBRO','OTROS',
  'FECHA','INDICE DESDE','INDICE HASTA','LIBRO','ESTADO LIBRO',
  'FIRMA','FIRMA (APELLIDO Y NOMBRE)','REGISTRADO'
];

// Versículo que se informa en cada mes (hoja CONCURSO)
const VERSICULOS_MES = {
  ABRIL:      'SANTIAGO 1:12-18',
  MAYO:       'SALMOS 40:1-5',
  JUNIO:      'NUMEROS 6:24-26',
  JULIO:      '1 CO. 6:9-11; EFESIOS 4:17-24',
  AGOSTO:     'OSEAS 11:1-8',
  SEPTIEMBRE: 'SALMOS 16:5-6',
  OCTUBRE:    'JUAN 4:13-14'
};


/* ============================================================
   LECTURA — el formulario pide la lista de nombres
   ============================================================ */
function doGet(e) {
  try {
    const accion = (e && e.parameter && e.parameter.accion) || 'nombres';
    if (accion === 'nombres') {
      return json({ ok: true, nombres: nombresDeLaPlanilla_() });
    }
    return json({ ok: false, error: 'Acción desconocida' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function nombresDeLaPlanilla_() {
  const libro = SpreadsheetApp.openById(ID_PLANILLA);
  const set = {};
  libro.getSheets().forEach(function (hoja) {
    const titulo = hoja.getName().trim().toUpperCase();
    if (HOJAS_EXCLUIDAS.indexOf(titulo) !== -1) return;
    const ultima = hoja.getLastRow();
    if (ultima < 2) return;
    hoja.getRange(2, 1, ultima - 1, 1).getValues().forEach(function (fila) {
      const v = String(fila[0] || '').trim().toUpperCase();
      if (v && v !== 'NOMBRE') set[v] = true;
    });
  });
  return Object.keys(set).sort();
}


/* ============================================================
   ESCRITURA — llega un registro del formulario
   ============================================================ */
function doPost(e) {
  const candado = LockService.getScriptLock();
  try {
    candado.waitLock(30000);
    const d = JSON.parse(e.postData.contents);

    if (!d.nombre) throw new Error('Falta el nombre');
    if (!d.fecha)  throw new Error('Falta la fecha');

    const hoja = hojaDelMes_(d.mesHoja);

    // Firma: se guarda como PNG en Drive y en la celda queda el enlace
    let celdaFirma = '';
    if (d.firma) {
      const url = guardarFirma_(d.firma, d.nombre, d.fecha);
      celdaFirma = '=HYPERLINK("' + url + '";"Ver firma")';
    }

    const leyoLibro = (d.estadoLibro === 'LEYENDO' || d.estadoLibro === 'COMPLETO') ? 1 : 0;
    const otros = leyoLibro ? (d.libro + ' — ' + d.estadoLibro) : '';
    const versiculo = (Number(d.versos) > 0)
      ? (VERSICULOS_MES[d.mesConsigna] || d.mesConsigna)
      : 0;

    hoja.appendRow([
      d.nombre,                                  // A NOMBRE
      d.asistencia,                              // B ASISTENCIA
      d.puntualidad,                             // C PUNTUALIDAD
      Number(d.lectura) || 0,                    // D LECTURA
      versiculo,                                 // E VERSICULOS
      Number(d.versos) || 0,                     // F VERSOS
      Number(d.indice) || 0,                     // G INDICE
      Number(d.folletos) || 0,                   // H FOLLETOS
      d.invitada === 'SI' ? 1 : 0,               // I INVITADA
      leyoLibro,                                 // J LECTURA DE LIBRO
      otros,                                     // K OTROS
      d.fecha,                                   // L FECHA
      d.indiceDesde || '',                       // M INDICE DESDE
      d.indiceHasta || '',                       // N INDICE HASTA
      d.libro || '',                             // O LIBRO
      d.estadoLibro,                             // P ESTADO LIBRO
      celdaFirma,                                // Q FIRMA
      d.firmante || '',                          // R FIRMA (APELLIDO Y NOMBRE)
      new Date()                                 // S REGISTRADO
    ]);

    return json({ ok: true, hoja: hoja.getName(), fila: hoja.getLastRow() });

  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { candado.releaseLock(); } catch (x) {}
  }
}


/* ============================================================
   AUXILIARES
   ============================================================ */

/** Devuelve la hoja del mes; si no existe, la crea con los encabezados. */
function hojaDelMes_(mes) {
  const libro = SpreadsheetApp.openById(ID_PLANILLA);
  const nombre = String(mes || '').trim().toUpperCase();
  let hoja = libro.getSheetByName(nombre);

  if (!hoja) {
    // por si la hoja existente tiene espacios extra en el nombre
    hoja = libro.getSheets().filter(function (h) {
      return h.getName().trim().toUpperCase() === nombre;
    })[0];
  }

  if (!hoja) {
    hoja = libro.insertSheet(nombre);
    hoja.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS]);
    hoja.getRange(1, 1, 1, ENCABEZADOS.length)
        .setFontWeight('bold')
        .setFontColor('#ffffff')
        .setBackground('#D6217F')
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setWrap(true);
    hoja.setFrozenRows(1);
    hoja.setColumnWidth(1, 190);   // NOMBRE
    hoja.setColumnWidth(5, 200);   // VERSICULOS
    hoja.setColumnWidth(11, 260);  // OTROS
    hoja.setRowHeight(1, 40);
  }
  return hoja;
}

/** Guarda la firma (PNG en base64) en Drive y devuelve el enlace. */
function guardarFirma_(dataUrl, nombre, fecha) {
  const base64 = dataUrl.split(',')[1];
  const bytes = Utilities.base64Decode(base64);
  const archivo = DriveApp.createFile(
    Utilities.newBlob(bytes, 'image/png',
      'firma_' + fecha + '_' + String(nombre).replace(/[^\wÁÉÍÓÚÑáéíóúñ ]/g, '') + '.png')
  );
  carpetaFirmas_().addFile(archivo);
  try { DriveApp.getRootFolder().removeFile(archivo); } catch (e) {}
  if (FIRMAS_PUBLICAS) {
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
  return archivo.getUrl();
}

function carpetaFirmas_() {
  const it = DriveApp.getFoldersByName(CARPETA_FIRMAS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_FIRMAS);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ============================================================
   PRUEBA — ejecutar esta función una vez desde el editor
   para dar los permisos y verificar que todo anda.
   ============================================================ */
function probar() {
  const resultado = doPost({
    postData: {
      contents: JSON.stringify({
        nombre: 'PRUEBA BORRAR',
        fecha: '2026-08-13',
        mesHoja: 'AGOSTO',
        mesConsigna: 'JULIO',
        asistencia: 'SI',
        puntualidad: 'SI',
        lectura: 12,
        versos: 5,
        indiceDesde: 'Mateo',
        indiceHasta: 'Efesios',
        indice: 10,
        folletos: 3,
        invitada: 'NO',
        libro: 'MUJERES PIADOSAS',
        estadoLibro: 'LEYENDO',
        firmante: 'Prueba de conexión',
        firma: ''
      })
    }
  });
  Logger.log(resultado.getContent());
  Logger.log('Nombres en la planilla: ' + nombresDeLaPlanilla_().length);
}
