export function setupEmotionAutocomplete() {
    // Mapeo de emociones y sus emojis
    const emotionsMap = {
        'Alegría': '😊',
        'Tristeza': '😢',
        'Enojo': '😡',
        'Miedo': '😨',
        'Asombro': '🤯',
        'Amor': '❤️',
        'Sorpresa': '😲',
        'Ansiedad': '😰',
        'Paz': '🕊️',
        'Celos': '😠',
        'Orgullo': '😎',
        'Vergüenza': '😳',
        'Compasión': '🥹',
        'Frustración': '😤',
        'Esperanza': '🌟',
        'Desesperación': '😩',
        'Curiosidad': '🤔',
        'Gratitud': '🙏',
        'Nostalgia': '🕰️',
        'Euforia': '🤑'
    };
    
    // Obtener todos los textareas y inputs de texto existentes
    const textInputs = document.querySelectorAll('textarea, input[type="text"]');
    
    // Aplicar autocompletado a los campos existentes
    applyAutocompleteToInputs(textInputs, emotionsMap);
    
    // Configurar el observador de mutaciones para detectar nuevos campos de texto
    setupMutationObserver(emotionsMap);
    
    console.log('Autocompletado de emociones configurado correctamente');
}

function setupMutationObserver(emotionsMap) {
    // Observa cambios en el DOM para detectar nuevos campos de texto
    const observer = new MutationObserver((mutations) => {
        let newInputsFound = false;
        
        mutations.forEach(mutation => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const inputs = node.querySelectorAll('textarea, input[type="text"]');
                        if (inputs.length > 0) {
                            newInputsFound = true;
                            applyAutocompleteToInputs(inputs, emotionsMap);
                        }
                        
                        if (node.nodeName === 'TEXTAREA' || 
                            (node.nodeName === 'INPUT' && node.type === 'text')) {
                            newInputsFound = true;
                            applyAutocompleteToInputs([node], emotionsMap);
                        }
                    }
                });
            }
        });
        
        if (newInputsFound) {
            console.log('Nuevos campos de texto detectados y configurados para autocompletado');
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
}

function applyAutocompleteToInputs(inputs, emotionsMap) {
    console.log(`Aplicando autocompletado a ${inputs.length} campo(s) de texto`);
    
    inputs.forEach(input => {
        // Evitar duplicar el autocompletado
        if (input.dataset.emotionAutocomplete === 'true') {
            return;
        }
        
        input.dataset.emotionAutocomplete = 'true';
        
        // Crear contenedor para el dropdown de emociones con estilo mejorado
        const dropdown = document.createElement('div');
        dropdown.className = 'emotion-autocomplete-dropdown';
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.backgroundColor = '#ffffff';
        dropdown.style.border = '2px solid #4a90e2'; // Borde más visible y colorido
        dropdown.style.borderRadius = '8px'; // Bordes más redondeados
        dropdown.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; // Sombra más pronunciada
        dropdown.style.maxHeight = '300px'; // Mayor altura para ver más opciones
        dropdown.style.overflowY = 'auto';
        dropdown.style.zIndex = '1000';
        dropdown.style.width = '300px'; // Más ancho para mejor visibilidad
        dropdown.style.fontFamily = 'inherit';
        dropdown.style.padding = '8px 0'; // Padding interior
        dropdown.style.transition = 'all 0.3s ease'; // Transición suave
        
        // Título del dropdown para mejor contexto
        const title = document.createElement('div');
        title.textContent = 'Selecciona una emoción';
        title.style.padding = '8px 12px';
        title.style.fontWeight = 'bold';
        title.style.borderBottom = '1px solid #e0e0e0';
        title.style.textAlign = 'center';
        title.style.backgroundColor = '#f0f8ff';
        dropdown.appendChild(title);
        
        // Añadir opciones al dropdown con mejor estilo
        Object.entries(emotionsMap).forEach(([emotion, emoji]) => {
            const option = document.createElement('div');
            option.className = 'emotion-option';
            option.innerHTML = `
                <span class="emoji">${emoji}</span>
                <span class="emotion-name">${emotion}</span>
                <span class="shortcut">${emotion.substring(0, 3).toUpperCase()}</span>
            `;
            option.style.padding = '10px 16px'; // Padding más amplio para mayor facilidad de clic
            option.style.cursor = 'pointer';
            option.style.display = 'flex';
            option.style.justifyContent = 'space-between';
            option.style.alignItems = 'center';
            option.style.borderBottom = '1px solid #f0f0f0';
            option.style.transition = 'background-color 0.2s';
            
            // Estilos para los elementos internos mejorados
            option.querySelector('.emoji').style.fontSize = '1.4em'; // Emoji más grande
            option.querySelector('.emotion-name').style.flexGrow = '1';
            option.querySelector('.emotion-name').style.margin = '0 15px';
            option.querySelector('.emotion-name').style.fontWeight = '500'; // Ligeramente más grueso
            option.querySelector('.shortcut').style.color = '#4a90e2'; // Color más visible
            option.querySelector('.shortcut').style.fontSize = '0.85em';
            option.querySelector('.shortcut').style.backgroundColor = '#f0f8ff'; // Fondo para el atajo
            option.querySelector('.shortcut').style.padding = '2px 5px';
            option.querySelector('.shortcut').style.borderRadius = '3px';
            
            option.addEventListener('click', () => {
                insertEmotion(input, emotion, emoji);
                dropdown.style.display = 'none';
            });
            
            option.addEventListener('mouseover', () => {
                option.style.backgroundColor = '#f0f8ff'; // Color de hover más notable
            });
            
            option.addEventListener('mouseout', () => {
                option.style.backgroundColor = '#ffffff';
            });
            
            dropdown.appendChild(option);
        });
        
        // Contenedor para el dropdown que nos ayudará a centrarlo
        const dropdownContainer = document.createElement('div');
        dropdownContainer.style.position = 'absolute';
        dropdownContainer.style.zIndex = '1000';
        dropdownContainer.style.width = '100%';
        dropdownContainer.style.pointerEvents = 'none'; // Permite clics a través del contenedor
        dropdownContainer.appendChild(dropdown);
        
        // Insertar el contenedor después del input
        document.body.appendChild(dropdownContainer);
        
        // Manejar el evento de entrada de texto
        input.addEventListener('input', (e) => {
            const value = input.value;
            const cursorPos = input.selectionStart;
            
            // Verificar si el usuario acaba de escribir '(' o está escribiendo dentro de paréntesis
            if (value[cursorPos - 1] === '(' || isInsideParentheses(value, cursorPos)) {
                showDropdown(input, dropdown, dropdownContainer);
                
                // Filtrar opciones si está escribiendo dentro de paréntesis
                if (isInsideParentheses(value, cursorPos)) {
                    const textInside = getTextInsideParentheses(value, cursorPos);
                    filterDropdownOptions(dropdown, textInside);
                }
            } else {
                dropdown.style.display = 'none';
            }
        });
        
        // Ocultar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target !== input && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
        
        // Manejar teclado para navegar el dropdown
        input.addEventListener('keydown', (e) => {
            if (dropdown.style.display === 'block') {
                const options = dropdown.querySelectorAll('.emotion-option');
                let selectedIndex = Array.from(options).findIndex(opt => 
                    opt.style.backgroundColor === 'rgb(240, 248, 255)');
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedIndex = (selectedIndex + 1) % options.length;
                    updateDropdownSelection(options, selectedIndex);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedIndex = (selectedIndex - 1 + options.length) % options.length;
                    updateDropdownSelection(options, selectedIndex);
                } else if (e.key === 'Enter' && selectedIndex >= 0) {
                    e.preventDefault();
                    options[selectedIndex].click();
                } else if (e.key === 'Escape') {
                    dropdown.style.display = 'none';
                } else if (e.key === 'Tab') {
                    e.preventDefault();
                    if (selectedIndex >= 0) {
                        options[selectedIndex].click();
                    }
                }
            }
        });
        
        // Mejorar el foco/blur para evitar cerrar el dropdown demasiado pronto
        let ignoreBlur = false;
        
        input.addEventListener('focus', () => {
            if (input.value[input.selectionStart - 1] === '(') {
                showDropdown(input, dropdown, dropdownContainer);
            }
        });
        
        dropdown.addEventListener('mousedown', () => {
            ignoreBlur = true;
            setTimeout(() => { ignoreBlur = false; }, 100);
        });
        
        input.addEventListener('blur', () => {
            if (!ignoreBlur) {
                setTimeout(() => {
                    if (!dropdown.contains(document.activeElement)) {
                        dropdown.style.display = 'none';
                    }
                }, 200);
            }
        });
    });
}

// Función para insertar la emoción en el input
function insertEmotion(input, emotion, emoji) {
    const currentValue = input.value;
    const cursorPos = input.selectionStart;
    const textBeforeCursor = currentValue.substring(0, cursorPos);
    const lastOpenParen = textBeforeCursor.lastIndexOf('(');
    
    // Construir nuevo valor con formato mejorado
    const newValue = currentValue.substring(0, lastOpenParen) + 
                    `(${emotion} ${emoji}) ` + 
                    currentValue.substring(cursorPos);
    
    input.value = newValue;
    input.focus();
    
    // Posicionar el cursor después de la emoción insertada y el espacio
    const newCursorPos = lastOpenParen + emotion.length + emoji.length + 4;
    input.setSelectionRange(newCursorPos, newCursorPos);
    
    // Disparar evento de input para actualizar otros componentes
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
}

// Función para mostrar el dropdown centrado
function showDropdown(input, dropdown, container) {
    const rect = input.getBoundingClientRect();
    
    // Posicionar el contenedor en relación al input
    container.style.top = `${rect.bottom + window.scrollY}px`;
    container.style.left = `${rect.left + window.scrollX}px`;
    container.style.width = `${rect.width}px`;
    
    // Centrar el dropdown dentro del contenedor
    dropdown.style.left = '50%';
    dropdown.style.transform = 'translateX(-50%)'; // Centrar horizontalmente
    dropdown.style.pointerEvents = 'auto'; // Permitir interacción
    dropdown.style.display = 'block';
    
    // Efecto de aparición suave
    dropdown.style.opacity = '0';
    dropdown.style.marginTop = '-10px';
    
    // Animar la aparición
    setTimeout(() => {
        dropdown.style.opacity = '1';
        dropdown.style.marginTop = '0';
    }, 10);
    
    // Asegurarse de que todas las opciones sean visibles inicialmente
    const options = dropdown.querySelectorAll('.emotion-option');
    options.forEach(opt => {
        opt.style.display = 'flex';
        opt.style.backgroundColor = '#ffffff';
    });
    
    // Añadir indicador visual para mostrar que el dropdown está activo
    input.style.borderColor = '#4a90e2';
    input.style.boxShadow = '0 0 0 2px rgba(74, 144, 226, 0.2)';
}

// Función para filtrar opciones del dropdown con resultados mejorados
function filterDropdownOptions(dropdown, filterText) {
    const title = dropdown.querySelector('div:first-child');
    const options = dropdown.querySelectorAll('.emotion-option');
    let hasMatches = false;
    let matchCount = 0;
    
    // Actualizar el título con el texto de búsqueda
    if (filterText) {
        title.textContent = `Buscando: "${filterText}"`;
    } else {
        title.textContent = 'Selecciona una emoción';
    }
    
    options.forEach(option => {
        const emotionName = option.querySelector('.emotion-name').textContent.toLowerCase();
        const shortcut = option.querySelector('.shortcut').textContent.toLowerCase();
        const searchText = filterText.toLowerCase();
        
        if (emotionName.includes(searchText) || shortcut.includes(searchText)) {
            option.style.display = 'flex';
            
            // Resaltar el texto coincidente
            if (searchText) {
                const nameElement = option.querySelector('.emotion-name');
                const originalName = nameElement.textContent;
                const lowerName = originalName.toLowerCase();
                const matchIndex = lowerName.indexOf(searchText);
                
                if (matchIndex >= 0) {
                    nameElement.innerHTML = originalName.substring(0, matchIndex) + 
                        `<span style="background-color: #ffff80; font-weight: bold;">` + 
                        originalName.substring(matchIndex, matchIndex + searchText.length) + 
                        '</span>' + 
                        originalName.substring(matchIndex + searchText.length);
                }
            }
            
            hasMatches = true;
            matchCount++;
        } else {
            option.style.display = 'none';
        }
    });
    
    // Si no hay coincidencias, mostrar un mensaje mejorado
    if (!hasMatches) {
        // Eliminar mensaje previo si existe
        const existingMessage = dropdown.querySelector('.no-results');
        if (existingMessage) {
            dropdown.removeChild(existingMessage);
        }
        
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 24px; margin-bottom: 10px;">😕</div>
                <div style="font-weight: bold; margin-bottom: 5px;">No se encontraron emociones</div>
                <div style="color: #666; font-size: 0.9em;">Intenta con otro término</div>
            </div>
        `;
        
        dropdown.appendChild(noResults);
    } else {
        // Actualizar el contador en el título
        title.textContent = `${matchCount} ${matchCount === 1 ? 'emoción encontrada' : 'emociones encontradas'}`;
    }
}

// Función para actualizar la selección en el dropdown
function updateDropdownSelection(options, selectedIndex) {
    options.forEach((opt, idx) => {
        if (idx === selectedIndex) {
            opt.style.backgroundColor = '#e0f2ff'; // Color de selección más visible
            opt.style.borderLeft = '3px solid #4a90e2'; // Indicador visual de selección
        } else {
            opt.style.backgroundColor = '#ffffff';
            opt.style.borderLeft = '3px solid transparent';
        }
    });
    
    // Asegurar que la opción seleccionada es visible
    if (options[selectedIndex]) {
        options[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

// Función para verificar si el cursor está dentro de paréntesis
function isInsideParentheses(text, cursorPos) {
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastOpenParen = textBeforeCursor.lastIndexOf('(');
    const lastCloseParen = textBeforeCursor.lastIndexOf(')');
    
    return lastOpenParen > lastCloseParen;
}

// Función para obtener el texto dentro de paréntesis
function getTextInsideParentheses(text, cursorPos) {
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastOpenParen = textBeforeCursor.lastIndexOf('(');
    
    if (lastOpenParen === -1) return '';
    
    return textBeforeCursor.substring(lastOpenParen + 1);
}

// Añadir estilos CSS para mejor apariencia
function addEmotionAutocompleteStyles() {
    if (document.getElementById('emotion-autocomplete-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'emotion-autocomplete-styles';
    style.textContent = `
        .emotion-autocomplete-dropdown {
            transition: opacity 0.3s ease, margin-top 0.3s ease;
            opacity: 0;
            margin-top: -10px;
        }
        
        input[data-emotion-autocomplete="true"]:focus,
        textarea[data-emotion-autocomplete="true"]:focus {
            outline: none;
            transition: border-color 0.3s, box-shadow 0.3s;
        }
        
        .emotion-option {
            transition: all 0.2s ease;
        }
        
        .emotion-option:hover {
            background-color: #e0f2ff !important;
            transform: translateX(3px);
        }
        
        .emotion-option:active {
            background-color: #d0e8ff !important;
        }
        
        /* Barra de desplazamiento personalizada */
        .emotion-autocomplete-dropdown::-webkit-scrollbar {
            width: 8px;
        }
        
        .emotion-autocomplete-dropdown::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        .emotion-autocomplete-dropdown::-webkit-scrollbar-thumb {
            background: #c1d8f0;
            border-radius: 4px;
        }
        
        .emotion-autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
            background: #4a90e2;
        }
        
        /* Añadir animación pulsante para nuevo dropdown */
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(74, 144, 226, 0); }
            100% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0); }
        }
        
        .emotion-autocomplete-dropdown-new {
            animation: pulse 2s infinite;
        }
    `;
    document.head.appendChild(style);
}

// Inicializar estilos al cargar la función
addEmotionAutocompleteStyles();