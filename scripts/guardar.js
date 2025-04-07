/**
 * Exporta todas las escenas a formato JSON
 * @returns {string} Cadena con el JSON formateado
 */

export function exportarEscenasAJSON() {
    // Seleccionar todos los elementos de escena
    const escenas = document.querySelectorAll('.scene');
    const resultado = [];
    
    // Recorrer cada escena
    escenas.forEach((escena, index) => {
        // Obtener los elementos necesarios con manejo de errores
        const tituloElement = escena.querySelector('.scene-title');
        const contenidoElement = escena.querySelector('.scene-content');
        const velocidadElement = escena.querySelector('input[type="range"]');
        const tiempoElement = escena.querySelector('input[type="text"][data-emotion-autocomplete]');
        
        // Verificar que todos los elementos existan
        if (!tituloElement || !contenidoElement || !velocidadElement || !tiempoElement) {
            console.warn(`Escena ${index + 1} no tiene todos los elementos necesarios`);
            return; // Salta esta escena
        }
        
        // Extraer los datos de cada escena con valores por defecto en caso de error
        const titulo = tituloElement.textContent || `Escena ${index + 1}`;
        const contenido = contenidoElement.textContent ? contenidoElement.textContent.trim() : '';
        
        // Obtener los controles con valores por defecto
        const velocidad = velocidadElement.value ? parseInt(velocidadElement.value) : 50;
        const tiempo = tiempoElement.value || '00:00';
        
        // Crear objeto con los datos de la escena
        const escenaData = {
            id: index + 1, // Numeración automática
            titulo: titulo,
            contenido: contenido,
            velocidad: velocidad,
            tiempo: tiempo,
            // Puedes añadir más propiedades si necesitas guardar más información
        };
        
        resultado.push(escenaData);
    });
    
    // Verificar que haya al menos una escena
    if (resultado.length === 0) {
        console.error('No se encontraron escenas para exportar');
        return JSON.stringify([{ 
            titulo: 'Escena vacía', 
            contenido: 'Contenido vacío', 
            velocidad: 50, 
            tiempo: '00:00',
            id: 1
        }], null, 2);
    }
    
    // Convertir a JSON con formato bonito (2 espacios de indentación)
    const jsonResultado = JSON.stringify(resultado, null, 2);
    
    console.log(`Exportadas ${resultado.length} escenas a JSON`);
    
    // Devolver el JSON
    return jsonResultado;
}

/**
 * Descarga el contenido JSON como un archivo
 * @param {string} contenido - Contenido JSON a descargar
 * @param {string} nombreArchivo - Nombre del archivo (por defecto "escenas.json")
 */
export function descargarJSON(contenido, nombreArchivo = 'escenas.json') {
    try {
        // Verificar que el contenido sea válido
        if (!contenido) {
            throw new Error('El contenido JSON está vacío');
        }
        
        // Asegurarse de que el nombre tenga la extensión .json
        if (!nombreArchivo.endsWith('.json')) {
            nombreArchivo += '.json';
        }
        
        // Crear el blob con el contenido
        const blob = new Blob([contenido], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Crear y configurar el elemento de descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        
        // Añadir al DOM, hacer clic y limpiar
        document.body.appendChild(a);
        a.click();
        
        // Pequeño timeout para asegurar que la descarga comience antes de limpiar
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log(`Archivo "${nombreArchivo}" descargado correctamente`);
        }, 100);
    } catch (error) {
        console.error('Error al descargar el archivo JSON:', error);
        alert('Error al descargar el archivo. Verifica la consola para más detalles.');
    }
}

/**
 * Función combinada para exportar y descargar escenas
 * @param {string} nombreArchivo - Nombre opcional del archivo
 */
export function exportarYDescargarEscenas(nombreArchivo = 'escenas.json') {
    const jsonData = exportarEscenasAJSON();
    if (jsonData) {
        descargarJSON(jsonData, nombreArchivo);
    } else {
        alert('No se pudo generar el JSON para descargar');
    }
}