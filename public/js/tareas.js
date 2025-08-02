// API Configuration
const API_BASE_URL = '/api/tareas';

// DOM Elements
const elements = {
    tasksTable: document.getElementById('tasks-table'),
    tasksTbody: document.getElementById('tasks-tbody'),
    addTaskBtn: document.getElementById('add-task-btn'),
    saveTasksBtn: document.getElementById('save-tasks-btn'),
    unsavedIndicator: document.getElementById('unsaved-indicator'),
    successToast: document.getElementById('successToast'),
    sectionToggleBtn: document.querySelector('.section-toggle-btn'),
    collapseIcon: document.querySelector('.collapse-icon')
};

// State management
let tasks = [];
let hasUnsavedChanges = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    try {
        await loadTasks();
        setupEventListeners();
    } catch (error) {
        console.error('Error de inicialización:', error);
        showError('Error al inicializar la aplicación');
    }
}

// Setup event listeners
function setupEventListeners() {
    elements.addTaskBtn.addEventListener('click', addNewTask);
    elements.saveTasksBtn.addEventListener('click', saveTasks);
    
    // Collapse functionality
    elements.sectionToggleBtn.addEventListener('click', toggleSection);
    
    // Setup table event delegation
    elements.tasksTbody.addEventListener('input', handleCellEdit);
    elements.tasksTbody.addEventListener('click', handleTableClick);
    
    // Warn before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Load tasks from API
async function loadTasks() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Error al cargar las tareas');
        
        tasks = await response.json();
        console.log('Tasks loaded from API:', tasks);
        
        // If no tasks exist in the database, load default tasks
        if (!tasks || tasks.length === 0) {
            console.log('No tasks found in database, loading default tasks');
            tasks = getDefaultTasks();
        }
        
        renderTasks();
    } catch (error) {
        console.error('Error al cargar las tareas:', error);
        // If API fails, start with default tasks
        tasks = getDefaultTasks();
        renderTasks();
    }
}

// Get default tasks data
function getDefaultTasks() {
    return [
        {
            tarea: "Obtener información básica sobre conceptos tecnológicos",
            recurso: "Perplexity"
        },
        {
            tarea: "Crear mapas mentales",
            recurso: "1.- Pedir a una IA que genere el código Markdown para crear un mapa mental con la información contenida en el documento, un texto etc.\n2.- Pegar ese código en el editor online de markmap.js.org"
        },
        {
            tarea: "Crear diagramas de Gantt",
            recurso: "1.- Pedir a una IA que genere el código Mermaid para crear un Diagrama de Gantt con la información contenida en el documento, un texto etc.\n2.- Pegar ese código en el editor online de https://mermaid.live/"
        },
        {
            tarea: "Agentes LLM personalizados",
            recurso: "Agente Mistral"
        },
        {
            tarea: "Transcribir audio a texto",
            recurso: "En investigación..."
        },
        {
            tarea: "Redactar actas en base a audio de reunión",
            recurso: "OBS + NotebookLM, Otter.ai (Free: 300 minutos mensuales de transcripción, 30 minutos por conversación)"
        },
        {
            tarea: "Generar elementos visuales partiendo de textos para documentación (ofertas, actas, manuales, etc.)",
            recurso: "napkin.ai"
        },
        {
            tarea: "Maquetar bloques partiendo de Figma",
            recurso: "Gemini 2.5 "
        },
        {
            tarea: "Estructurar redacción de textos (emails, actas, ofertas, manuales, etc.)",
            recurso: "Gemini 2.5 "
        },
        {
            tarea: "Reescribir textos para tono formal, técnico, profesional",
            recurso: "Gemini 2.5 "
        },
        {
            tarea: "Descripción de imágenes",
            recurso: "Mistral, ChatGPT"
        },
        {
            tarea: "Traducción de textos",
            recurso: "ChatGPT, Gemini, Claude, Perplexity, Mistral"
        },
        {
            tarea: "Conversión entre diferentes formatos de datos (tablas, listas, JSON, CSV)",
            recurso: "ChatGPT, Gemini, Claude, Perplexity, Mistral"
        },
        {
            tarea: "Obtener la base de una planificación de proyecto a partir de una oferta",
            recurso: "IA local por privacidad"
        },
        {
            tarea: "Comprensión de errores de consola en administración de sistemas",
            recurso: "Claude Sonet"
        },
        {
            tarea: "Escribir código",
            recurso: "Claude Sonet, GitHub Copilot, Codeium, otros (evaluando opciones)"
        },
        {
            tarea: "Optimizar código ya creado",
            recurso: "Claude Sonet, GitHub Copilot, Codeium, otros (evaluando opciones)"
        },
        {
            tarea: "Comprensión de errores en el código que se muestran en los logs",
            recurso: "Claude Sonet, GitHub Copilot, Codeium, otros (evaluando opciones)"
        },
        {
            tarea: "Generación de prototipos de aplicaciones y webs",
            recurso: "Firebase, studio, Bolt.new, llamacoder.together.ai, https://huggingface.co/spaces/Qwen/Qwen2.5-Coder-Artifacts, vercel.com, websim.ai"
        },
        {
            tarea: "Agentes online (de pago pero con tokens free)",
            recurso: "Manus.ai, You.com.  GenSpark.ai, Convergence.ai, Lindy.ai"
        },
        {
            tarea: "INVESTIGANDO",
            recurso: ""
        },
        {
            tarea: "Maquetación y estilos de diseño completo a partir de Figma",
            recurso: "-"
        },
        {
            tarea: "Uso de agents personalizados",
            recurso: "n8n"
        },
        {
            tarea: "Ranking de modelos",
            recurso: "Artificial Analysis"
        },
        {
            tarea: "Ranking de modelos",
            recurso: "https://lmarena.ai/?leaderboard"
        },
        {
            tarea: "Comparar respuestas de varios modelos",
            recurso: "https://lmarena.ai/"
        },
        {
            tarea: "Mejorar Prompts",
            recurso: "Platform OpenAI, https://danielzas.com/ia/"
        },
        {
            tarea: "Agentes IA verificados",
            recurso: "https://bipphquz.manus.space/"
        },
        {
            tarea: "Detector de textos con IA",
            recurso: "https://www.zerogpt.com/   https://quillbot.com/es/detector-de-ia"
        }
    ];
}

// Render tasks table
function renderTasks() {
    if (tasks.length === 0) {
        elements.tasksTbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-5">
                    <i class="bi bi-inbox display-1 text-muted"></i>
                    <h5 class="mt-3 text-muted">No hay tareas registradas</h5>
                    <p class="text-muted">¡Añade tu primera tarea para comenzar!</p>
                </td>
            </tr>
        `;
        return;
    }

    elements.tasksTbody.innerHTML = tasks.map((task, index) => `
        <tr class="task-row" data-index="${index}">
            <td>
                <div class="editable-cell" contenteditable="true" data-field="tarea">${escapeHtml(task.tarea || '')}</div>
            </td>
            <td>
                <div class="editable-cell" contenteditable="true" data-field="recurso">${escapeHtml(task.recurso || '')}</div>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger delete-task-btn" data-index="${index}" title="Eliminar esta tarea">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Handle cell editing
function handleCellEdit(e) {
    if (e.target.classList.contains('editable-cell')) {
        markAsUnsaved();
        
        const row = e.target.closest('tr');
        const index = parseInt(row.dataset.index);
        const field = e.target.dataset.field;
        const value = e.target.textContent.trim();
        
        if (tasks[index]) {
            tasks[index][field] = value;
        }
    }
}

// Handle table clicks (delete buttons)
function handleTableClick(e) {
    if (e.target.closest('.delete-task-btn')) {
        const btn = e.target.closest('.delete-task-btn');
        const index = parseInt(btn.dataset.index);
        deleteTask(index);
    }
}

// Add new task
function addNewTask() {
    const newTask = {
        tarea: "Nueva tarea",
        recurso: "Recurso por definir"
    };
    
    tasks.push(newTask);
    renderTasks();
    markAsUnsaved();
    
    // Focus on the new task's title cell
    setTimeout(() => {
        const lastRow = elements.tasksTbody.lastElementChild;
        const titleCell = lastRow.querySelector('[data-field="tarea"]');
        if (titleCell) {
            titleCell.focus();
            selectAllText(titleCell);
        }
    }, 100);
}

// Delete task
function deleteTask(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        tasks.splice(index, 1);
        renderTasks();
        markAsUnsaved();
    }
}

// Save tasks to database
async function saveTasks() {
    try {
        const saveBtn = elements.saveTasksBtn;
        const originalText = saveBtn.innerHTML;
        
        // Show loading state
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Guardando...';
        
        const response = await fetch(API_BASE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tasks })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar las tareas');
        }

        const result = await response.json();
        tasks = result.tasks || tasks;
        
        markAsSaved();
        showSuccess('Tareas guardadas exitosamente');
        
    } catch (error) {
        console.error('Error al guardar las tareas:', error);
        showError('Error al guardar las tareas: ' + error.message);
    } finally {
        // Reset button state
        elements.saveTasksBtn.disabled = false;
        elements.saveTasksBtn.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Tareas';
    }
}

// Toggle section collapse
function toggleSection() {
    const isExpanded = elements.collapseIcon.classList.contains('rotated');
    
    if (isExpanded) {
        elements.collapseIcon.classList.remove('rotated');
    } else {
        elements.collapseIcon.classList.add('rotated');
    }
}

// Mark as unsaved
function markAsUnsaved() {
    hasUnsavedChanges = true;
    elements.unsavedIndicator.classList.add('show');
}

// Mark as saved
function markAsSaved() {
    hasUnsavedChanges = false;
    elements.unsavedIndicator.classList.remove('show');
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function selectAllText(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function showSuccess(message) {
    const toastEl = elements.successToast;
    if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        document.querySelector('#successToast .toast-body').textContent = message;
        toast.show();
    }
}

function showError(message) {
    alert('Error: ' + message);
}
