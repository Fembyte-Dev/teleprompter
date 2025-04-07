/**
 * Sistema de Teleprompter con gestión de emociones y notas de escena
 * Gestiona el inicio, reproducción y finalización de escenas
 */

// Variables globales para almacenar información de la escena actual
let currentSceneContent = '';
let currentSceneSpeed = 0;
let currentSceneTitle = '';

// Función principal para iniciar el teleprompter
function initTeleprompter() {
    // Seleccionar todos los botones de inicio
    const startButtons = document.querySelectorAll('.start-button');
    
    // Asignar evento a cada botón de inicio
    startButtons.forEach(startBtn => {
        startBtn.addEventListener('click', function() {
            // Obtener el contenedor de la escena
            const scene = this.closest('.scene');
            
            // Obtener información de la escena
            const sceneTitle = scene.querySelector('.scene-title').textContent;
            const sceneContent = scene.querySelector('.scene-content').textContent;
            const speedValue = scene.querySelector('input[type="range"]').value;
            const timeValue = scene.querySelector('input[type="text"]').value;
            
            // Guardar información de la escena actual
            currentSceneContent = sceneContent;
            currentSceneSpeed = speedValue;
            currentSceneTitle = sceneTitle;
            
            // Iniciar cuenta regresiva y luego mostrar el teleprompter
            startCountdown(timeValue, function() {
                showTeleprompter(sceneContent, speedValue, sceneTitle);
            });
        });
    });
}

/**
 * Inicia cuenta regresiva antes de mostrar el teleprompter
 * @param {string} timeString - Tiempo en formato "5s"
 * @param {function} callback - Función a ejecutar al finalizar
 */
export function startCountdown(timeString, callback) {
    // Convertir timeString a segundos (eliminar 's')
    const seconds = parseInt(timeString.replace('s', ''));
    
    // Crear overlay de cuenta regresiva
    const countdownOverlay = document.createElement('div');
    countdownOverlay.className = 'countdown-overlay';
    countdownOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 5rem;
        z-index: 1000;
    `;
    
    document.body.appendChild(countdownOverlay);
    
    // Iniciar cuenta regresiva
    let timeLeft = seconds;
    countdownOverlay.textContent = timeLeft;
    
    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownOverlay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            document.body.removeChild(countdownOverlay);
            callback();
        }
    }, 1000);
}

/**
 * Procesa el texto para separar las emociones y notas de escena
 * y dividir el texto en secuencias
 * @param {string} text - Texto completo de la escena
 * @returns {Object} Secuencias de texto, emociones y notas de escena
 */
function processSceneText(text) {
    // Resultado a devolver
    const result = {
        sequences: [],
        emotions: [],
        notes: []
    };
    
    // Expresiones regulares para encontrar emociones y notas
    const emotionRegex = /\(([^)]+)\)/g;
    const noteRegex = /\[([^\]]+)\]/g;
    
    // Crear una copia del texto para trabajar
    let workingText = text;
    
    // Extraer emociones (texto entre paréntesis)
    const emotionMatches = [...text.matchAll(emotionRegex)];
    emotionMatches.forEach(match => {
        result.emotions.push({
            text: match[1],
            position: match.index,
            original: match[0]
        });
    });
    
    // Extraer notas (texto entre corchetes)
    const noteMatches = [...text.matchAll(noteRegex)];
    noteMatches.forEach(match => {
        result.notes.push({
            text: match[1],
            position: match.index,
            original: match[0]
        });
    });
    
    // Ordenar emociones y notas por posición para formar los segmentos
    const markers = [...result.emotions, ...result.notes].sort((a, b) => a.position - b.position);
    
    // Dividir el texto en secuencias basadas en los marcadores
    let lastIndex = 0;
    
    if (markers.length === 0) {
        // Si no hay marcadores, el texto entero es una secuencia
        result.sequences.push({
            text: text.trim(),
            type: 'text'
        });
    } else {
        // Iterar por los marcadores para dividir el texto
        markers.forEach(marker => {
            // Añadir el texto antes del marcador como una secuencia
            if (marker.position > lastIndex) {
                const textBefore = text.substring(lastIndex, marker.position).trim();
                if (textBefore) {
                    result.sequences.push({
                        text: textBefore,
                        type: 'text'
                    });
                }
            }
            
            // Añadir el marcador como una secuencia
            result.sequences.push({
                text: marker.text,
                type: marker.original.startsWith('(') ? 'emotion' : 'note',
                original: marker.original
            });
            
            // Actualizar el índice
            lastIndex = marker.position + marker.original.length;
        });
        
        // Añadir el texto después del último marcador
        if (lastIndex < text.length) {
            const textAfter = text.substring(lastIndex).trim();
            if (textAfter) {
                result.sequences.push({
                    text: textAfter,
                    type: 'text'
                });
            }
        }
    }
    
    return result;
}

/**
 * Muestra el teleprompter con el texto procesado en secuencias
 * @param {string} text - Texto completo de la escena
 * @param {number} speed - Velocidad de reproducción (1-100)
 * @param {string} title - Título de la escena
 */
export function showTeleprompter(text, speed, title) {
    // Procesar texto para extraer emociones, notas y dividir en secuencias
    const processedText = processSceneText(text);
    let currentSequenceIndex = 0;
    
    // Crear el overlay del teleprompter
    const teleprompterOverlay = document.createElement('div');
    teleprompterOverlay.className = 'teleprompter-overlay';
    teleprompterOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        color: white;
        display: flex;
        flex-direction: column;
        z-index: 1000;
    `;
    
    // Crear contenedor del texto
    const textContainer = document.createElement('div');
    textContainer.className = 'teleprompter-text';
    textContainer.style.cssText = `
        font-size: 2rem;
        text-align: center;
        padding: 2rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    `;
    
    // Crear elemento para el texto actual
    const currentTextElement = document.createElement('div');
    currentTextElement.style.cssText = `
        font-size: 3rem;
        color: #ffcc00;
        margin-bottom: 1rem;
        line-height: 1.4;
    `;
    textContainer.appendChild(currentTextElement);
    
    // Crear elemento para mostrar el texto que viene a continuación
    const upcomingTextElement = document.createElement('div');
    upcomingTextElement.style.cssText = `
        font-size: 1.8rem;
        color: #888;
        opacity: 0.7;
    `;
    textContainer.appendChild(upcomingTextElement);
    
    // Crear contenedor de emociones
    const emotionContainer = document.createElement('div');
    emotionContainer.className = 'emotion-display';
    emotionContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: rgba(255, 192, 203, 0.8);
        padding: 1rem;
        border-radius: 10px;
        font-size: 1.5rem;
        text-align: center;
        display: none;
    `;
    
    // Crear contenedor de notas
    const noteContainer = document.createElement('div');
    noteContainer.className = 'note-display';
    noteContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(255, 255, 255, 0.8);
        color: black;
        padding: 1rem;
        border-radius: 10px;
        font-size: 1.5rem;
        max-width: 80%;
        display: none;
    `;
    
    // Agregar elementos al overlay
    teleprompterOverlay.appendChild(textContainer);
    teleprompterOverlay.appendChild(emotionContainer);
    teleprompterOverlay.appendChild(noteContainer);
    
    document.body.appendChild(teleprompterOverlay);
    
    // Calcular velocidad (invertida: 100 es rápido, 1 es lento)
    // Ajuste para que sea más rápido o más lento según el valor de speed
    const baseDisplayTime = Math.max(200, 1000 - (speed * 8)); // Entre 200ms y 800ms
    
    // Función para actualizar la secuencia actual y las emociones/notas
    const updateSequence = () => {
        if (currentSequenceIndex < processedText.sequences.length) {
            const currentSequence = processedText.sequences[currentSequenceIndex];
            
            // Decidir qué hacer según el tipo de secuencia
            if (currentSequence.type === 'emotion') {
                // Actualizar la emoción actual
                emotionContainer.textContent = currentSequence.text;
                emotionContainer.style.display = 'block';
                
                // Avanzar rápidamente a la siguiente secuencia
                currentSequenceIndex++;
                setTimeout(updateSequence, 300); // Mostrar brevemente la emoción
            } 
            else if (currentSequence.type === 'note') {
                // Actualizar la nota actual
                noteContainer.textContent = currentSequence.text;
                noteContainer.style.display = 'block';
                
                // Avanzar rápidamente a la siguiente secuencia
                currentSequenceIndex++;
                setTimeout(updateSequence, 300); // Mostrar brevemente la nota
            }
            else {
                // Es texto normal para mostrar
                currentTextElement.textContent = currentSequence.text;
                
                // Mostrar el texto que viene a continuación (si existe)
                if (currentSequenceIndex + 1 < processedText.sequences.length) {
                    const nextSequence = processedText.sequences[currentSequenceIndex + 1];
                    if (nextSequence.type === 'text') {
                        upcomingTextElement.textContent = nextSequence.text;
                    } else {
                        upcomingTextElement.textContent = '';
                    }
                } else {
                    upcomingTextElement.textContent = '';
                }
                
                // Calcular el tiempo que debe mostrarse este texto
                // Más palabras = más tiempo en pantalla
                const wordCount = currentSequence.text.split(' ').length;
                const displayTime = baseDisplayTime * Math.max(1, Math.min(wordCount, 10));
                
                currentSequenceIndex++;
                setTimeout(updateSequence, displayTime);
            }
        } else {
            // Cuando se termina de mostrar todas las secuencias
            setTimeout(() => {
                showCompletionMenu(title, teleprompterOverlay);
            }, 1000);
        }
    };
    
    // Iniciar la visualización de secuencias
    updateSequence();
}

/**
 * Muestra el menú de finalización
 * @param {string} sceneTitle - Título de la escena
 * @param {HTMLElement} overlay - Elemento overlay a reemplazar
 */
function showCompletionMenu(sceneTitle, overlay) {
    // Crear menú de finalización
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'completion-menu';
    menuOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    // Título del menú
    const menuTitle = document.createElement('h2');
    menuTitle.textContent = `Escena completada: ${sceneTitle}`;
    menuTitle.style.marginBottom = '2rem';
    
    // Botones
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 1rem;
    `;
    
    // Botón repetir
    const repeatButton = document.createElement('button');
    repeatButton.textContent = 'Repetir escena';
    repeatButton.style.cssText = `
        padding: 1rem 2rem;
        background-color: #ff9cb7;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
    `;
    
    // Botón siguiente
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Siguiente escena';
    nextButton.style.cssText = `
        padding: 1rem 2rem;
        background-color: #ff9cb7;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
    `;
    
    // Agregar eventos a los botones
    repeatButton.addEventListener('click', () => {
        document.body.removeChild(menuOverlay);
        // Usar las variables globales para repetir la misma escena
        showTeleprompter(currentSceneContent, currentSceneSpeed, currentSceneTitle);
    });
    
    nextButton.addEventListener('click', () => {
        document.body.removeChild(menuOverlay);
        // Aquí debería ir la lógica para avanzar a la siguiente escena
        // Por ahora solo cerramos el overlay para volver a la interfaz principal
    });
    
    // Construir el menú
    buttonContainer.appendChild(repeatButton);
    buttonContainer.appendChild(nextButton);
    menuOverlay.appendChild(menuTitle);
    menuOverlay.appendChild(buttonContainer);
    
    // Reemplazar el overlay del teleprompter con el menú
    document.body.removeChild(overlay);
    document.body.appendChild(menuOverlay);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initTeleprompter);