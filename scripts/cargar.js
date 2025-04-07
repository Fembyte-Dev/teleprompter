/**
 * Carga escenas desde datos JSON y actualiza la interfaz
 * @param {string} jsonData - String con los datos JSON a cargar
 * @returns {boolean} - Indica si la carga fue exitosa
 * 
 */

import { setupSceneControls } from './controlEscenas.js';

export function cargarJSONDesdeArchivo(jsonData) {
    // Validar que el JSON no esté vacío
    if (!jsonData) {
        console.error('Error: El JSON está vacío');
        return false;
    }

    try {
        // Parsear el JSON con manejo de errores
        let escenasData;
        try {
            escenasData = JSON.parse(jsonData);
        } catch (e) {
            console.error('Error al parsear JSON:', e);
            alert('El formato del archivo JSON no es válido. Verifica el contenido.');
            return false;
        }

        // Verificar que sea un array
        if (!Array.isArray(escenasData)) {
            console.error('Error: El JSON no contiene un array de escenas');
            alert('El formato del archivo no es correcto. Se esperaba un array de escenas.');
            return false;
        }

        // Limpiar todas las escenas existentes excepto la primera
        const scenes = document.querySelectorAll('.scene');
        if (scenes.length > 1) {
            for (let i = scenes.length - 1; i > 0; i--) {
                scenes[i].remove();
            }
        }

        // Obtener la primera escena como plantilla
        const primeraEscena = document.querySelector('.scene');
        if (!primeraEscena) {
            console.error('Error: No se encontró ninguna escena en el DOM');
            alert('Error en la estructura de la página. No hay escenas disponibles.');
            return false;
        }

        // Verificar que todos los elementos necesarios existan en la primera escena
        const elementos = {
            titulo: primeraEscena.querySelector('.scene-title'),
            contenido: primeraEscena.querySelector('.scene-content'),
            velocidad: primeraEscena.querySelector('input[type="range"]'),
            tiempo: primeraEscena.querySelector('input[type="text"][data-emotion-autocomplete]')
        };

        for (const [nombre, elemento] of Object.entries(elementos)) {
            if (!elemento) {
                console.error(`Error: No se encontró el elemento ${nombre} en la escena`);
                alert(`Error en la estructura de la página. Falta el elemento ${nombre}.`);
                return false;
            }
        }

        // Recorrer cada escena en el JSON
        escenasData.forEach((escenaData, index) => {
            // Validar la estructura de cada objeto escena
            if (!escenaData.titulo || typeof escenaData.contenido === 'undefined') {
                console.warn(`Advertencia: La escena ${index} no tiene todos los campos requeridos`);
            }

            if (index === 0) {
                // Actualizar la primera escena existente
                elementos.titulo.textContent = escenaData.titulo || `Escena ${index + 1}`;
                elementos.contenido.textContent = escenaData.contenido || '';
                elementos.velocidad.value = escenaData.velocidad || 50;
                elementos.tiempo.value = escenaData.tiempo || '00:00';
            } else {
                // Crear una nueva escena clonando la primera
                const nuevaEscena = primeraEscena.cloneNode(true);
                
                // Actualizar los contenidos de la nueva escena
                nuevaEscena.querySelector('.scene-title').textContent = escenaData.titulo || `Escena ${index + 1}`;
                nuevaEscena.querySelector('.scene-content').textContent = escenaData.contenido || '';
                nuevaEscena.querySelector('input[type="range"]').value = escenaData.velocidad || 50;
                nuevaEscena.querySelector('input[type="text"][data-emotion-autocomplete]').value = escenaData.tiempo || '00:00';
                
                // Insertar la nueva escena en el DOM
                const buttonContainer = document.querySelector('.button-container');
                if (buttonContainer) {
                    buttonContainer.parentNode.insertBefore(nuevaEscena, buttonContainer);
                } else {
                    // Si no hay contenedor de botones, añadir al final del contenedor principal
                    const container = primeraEscena.parentNode;
                    container.appendChild(nuevaEscena);
                }

            }
        });

        // Reconfigurar los controles de todas las escenas
        if (typeof setupSceneControls === 'function') {
            setupSceneControls();
        } else {
            console.warn('Advertencia: La función setupSceneControls no está definida');
            // Aquí podrías implementar una configuración básica de escenas
        }
        
        console.log(`✅ Cargadas ${escenasData.length} escenas desde JSON`);
        return true;
    } catch (error) {
        console.error('Error general al cargar el archivo JSON:', error);
        alert('Error al cargar el archivo JSON. Ver detalles en la consola.');
        return false;
    }
}

/**
 * Crea un input file y maneja la carga de un archivo JSON
 */
export function cargarJSONDesdeInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) {
            console.log('No se seleccionó ningún archivo');
            return;
        }
        
        console.log(`Archivo seleccionado: ${file.name} (${file.size} bytes)`);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const resultado = cargarJSONDesdeArchivo(e.target.result);
            if (resultado) {
                alert('Escenas cargadas correctamente');
            }
        };
        reader.onerror = function() {
            console.error('Error al leer el archivo');
            alert('Error al leer el archivo. Intenta nuevamente.');
        };
        reader.readAsText(file);
    });
    
    // Simular clic en el input
    input.click();
}