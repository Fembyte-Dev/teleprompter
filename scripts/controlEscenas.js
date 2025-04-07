import { startCountdown, showTeleprompter } from './teleprompter.js';

export function setupSceneControls() {
    // Limpiar todos los listeners clonando todo el contenedor de escenas
    const scenesContainer = document.querySelector('#scenes-container'); // Asegúrate de tener este contenedor
    if (scenesContainer) {
        const cleanContainer = scenesContainer.cloneNode(true);
        scenesContainer.replaceWith(cleanContainer);
    }

    // Obtener todas las escenas nuevamente después de la limpieza
    const scenes = document.querySelectorAll('.scene');

    scenes.forEach((scene, index) => {
        const controls = scene.querySelector('.scene-controls');
        if (!controls) return;

        const speedInput = controls.querySelector('input[type="range"]');
        const timeInput = controls.querySelector('input[type="text"]');
        const sizeInput = controls.querySelector('input[type="number"]');
        const content = scene.querySelector('.scene-content');
        const editBtn = controls.querySelector('.scene-control-btn:nth-child(1)');
        const duplicateBtn = controls.querySelector('.scene-control-btn:nth-child(2)');
        const deleteBtn = controls.querySelector('.scene-control-btn:nth-child(3)');
        const startBtn = controls.querySelector('.start-button');

        // Botón de comenzar
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                const sceneTitle = scene.querySelector('.scene-title').textContent;
                const sceneContent = scene.querySelector('.scene-content').textContent;
                const speedValue = scene.querySelector('input[type="range"]').value;
                const timeValue = scene.querySelector('input[type="text"]').value;
                startCountdown(timeValue, function() {
                    showTeleprompter(sceneContent, speedValue, sceneTitle);
                });
            });
        }

        // Mostrar valor actual del slider de velocidad
        if (speedInput) {
            const speedLabel = controls.querySelector('.scene-control-group:nth-child(1) .scene-control-label');
            speedInput.addEventListener('input', function () {
                speedLabel.textContent = 'Velocidad: ' + this.value + '%';
            });
        }

        // Título editable
        const title = scene.querySelector('.scene-title');
        if (title) {
            title.addEventListener('click', makeTitleEditable);
        }

        // Botón de editar
        if (editBtn) {
            editBtn.addEventListener('click', function () {
                editSceneContent(content);
            });
        }

        // Botón de duplicar
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', function() {
                duplicateScene(scene);
            });
        }

        // Botón de eliminar
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                deleteScene(scene);
            });
        }
    });
}

// Funciones separadas para mejor organización
function makeTitleEditable() {
    const DEFAULT_TITLE = 'Agregar Título de Escena';
    const currentTitle = this.textContent === DEFAULT_TITLE ? '' : this.textContent;

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = currentTitle;
    titleInput.style.width = '100%';
    titleInput.style.fontSize = '16px';
    titleInput.style.padding = '5px';
    titleInput.style.border = '2px solid var(--color-border)';
    titleInput.style.borderRadius = '8px';
    titleInput.style.backgroundColor = 'var(--color-panel)';
    titleInput.placeholder = DEFAULT_TITLE;

    this.innerHTML = '';
    this.appendChild(titleInput);
    titleInput.focus();

    const saveTitle = () => {
        const newTitle = titleInput.value.trim() || DEFAULT_TITLE;
        this.textContent = newTitle;
    };

    titleInput.addEventListener('blur', saveTitle);
    titleInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            saveTitle();
            this.blur();
        }
    });

    if (currentTitle === '') {
        titleInput.setSelectionRange(0, titleInput.value.length);
    }
}

function editSceneContent(content) {
    const currentText = content.textContent.trim();
    content.innerHTML = `
        <div style="position:relative;">
            <textarea style="width:100%;min-height:80px;border:2px solid var(--color-border);border-radius:8px;padding:8px;margin-bottom:10px;font-family:inherit;">${currentText}</textarea>
            <div style="display:flex;justify-content:flex-end;">
                <button class="save-content-btn" style="background-color:var(--color-accent);color:white;border:none;border-radius:8px;padding:8px 15px;cursor:pointer;font-weight:bold;box-shadow:var(--shadow-default);transition:all 0.2s ease;">
                    <i class="fas fa-save" style="margin-right:5px;"></i> Guardar
                </button>
            </div>
        </div>
    `;
    
    const textarea = content.querySelector('textarea');
    const saveBtn = content.querySelector('.save-content-btn');
    
    textarea.focus();
    
    // Eliminar el evento blur para evitar que se guarde automáticamente
    // y permitir que funcione el autocompletado de emojis
    
    // Efecto hover para el botón
    saveBtn.addEventListener('mouseover', function() {
        this.style.backgroundColor = 'var(--color-button-hover)';
        this.style.transform = 'scale(1.05)';
    });
    
    saveBtn.addEventListener('mouseout', function() {
        this.style.backgroundColor = 'var(--color-accent)';
        this.style.transform = 'scale(1)';
    });
    
    // Guardar contenido solo cuando se hace clic en el botón
    saveBtn.addEventListener('click', function() {
        content.innerHTML = textarea.value;
    });
}

function duplicateScene(scene) {
    const maxScenes = 10;
    if (document.querySelectorAll('.scene').length >= maxScenes) {
        alert(`No puedes tener más de ${maxScenes} escenas`);
        return;
    }

    const newScene = scene.cloneNode(true);
    newScene.id = 'scene-' + Date.now();

    // Actualizar título
    const title = newScene.querySelector('.scene-title');
    if (title) {
        if (title.textContent.includes('(copia)')) {
            const match = title.textContent.match(/\(copia (\d+)\)/);
            if (match) {
                const num = parseInt(match[1]) + 1;
                title.textContent = title.textContent.replace(/\(copia \d+\)/, `(copia ${num})`);
            } else {
                title.textContent = title.textContent.replace('(copia)', '(copia 2)');
            }
        } else {
            title.textContent += ' (copia)';
        }
    }

    scene.parentNode.insertBefore(newScene, scene.nextSibling);
    
    // Configurar controles solo para la nueva escena
    setTimeout(() => {
        const newControls = newScene.querySelector('.scene-controls');
        if (newControls) {
            const cleanControls = newControls.cloneNode(true);
            newControls.replaceWith(cleanControls);
            setupSceneControlsForSingleScene(newScene);
        }
    }, 0);
}

function deleteScene(scene) {
    if (document.querySelectorAll('.scene').length > 1) {
        if (confirm('¿Estás seguro de que quieres eliminar esta escena?')) {
            scene.remove();
        }
    } else {
        alert('No puedes eliminar la única escena existente.');
    }
}

// Función para configurar controles de una sola escena
function setupSceneControlsForSingleScene(scene) {
    const controls = scene.querySelector('.scene-controls');
    if (!controls) return;

    // Configura solo los listeners necesarios para esta escena
    const duplicateBtn = controls.querySelector('.scene-control-btn:nth-child(2)');
    if (duplicateBtn) {
        duplicateBtn.addEventListener('click', function() {
            duplicateScene(scene);
        });
    }
}