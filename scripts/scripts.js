// Importar funciones de otros archivos
import { setupThemeToggle } from './cambioTema.js';
import { setupSceneControls } from './controlEscenas.js';
import { setupEmotionAutocomplete } from './emojinAutoCompletado.js';
import { exportarEscenasAJSON, descargarJSON } from './guardar.js';
import { cargarJSONDesdeInput } from './cargar.js';

// Función para configurar el botón de añadir escena
function setupAddSceneButton() {
    const addButton = document.querySelector('.add-button');
    if (addButton) {
        addButton.addEventListener('click', function() {
            const firstScene = document.querySelector('.scene');
            if (firstScene) {
                const newScene = firstScene.cloneNode(true);
                newScene.querySelector('.scene-content').textContent = 'Nueva escena. Haz clic para editar.';
                newScene.querySelector('.scene-title').textContent = 'Nueva escena';
                const buttonContainer = document.querySelector('.button-container');
                buttonContainer.parentNode.insertBefore(newScene, buttonContainer);
                setupSceneControls();
            }
        });
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el cambio de tema
    setupThemeToggle();
    
    // Configurar los controles de escena
    setupSceneControls();
    
    // Configurar el botón de añadir escena
    setupAddSceneButton();
    
    // Configurar el autocompletado de emociones
    setupEmotionAutocomplete();
    
    // Configurar el botón de guardar
    const saveButton = document.querySelector('.save-json');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const json = exportarEscenasAJSON();
            descargarJSON(json, 'escenas.json');
            alert('Escenas guardadas como JSON.');
        });
    }
    
    // Configurar el botón de cargar
    const loadButton = document.querySelector('.load-json');
    if (loadButton) {
        loadButton.addEventListener('click', cargarJSONDesdeInput);
    }
});

