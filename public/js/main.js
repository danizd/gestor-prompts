// Main application state and configuration
const API_BASE_URL = '/api/prompts';
let prompts = [];
let categories = new Set();

// DOM Elements
const elements = {
    promptsList: document.getElementById('promptsList'),
    searchInput: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    filterBtn: document.getElementById('filterBtn'),
    editModal: new bootstrap.Modal(document.getElementById('editPromptModal')),
    editForm: document.getElementById('editPromptForm'),
    newPromptModal: new bootstrap.Modal(document.getElementById('newPromptModal')),
    newPromptForm: document.getElementById('newPromptForm'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    importCsvBtn: document.getElementById('importCsvBtn'),
    csvFileInput: document.getElementById('csvFileInput')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    try {
        await loadPrompts();
        setupEventListeners();
    } catch (error) {
        console.error('Error de inicialización:', error);
        showError('Error al inicializar la aplicación');
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Search and filter
    elements.searchInput.addEventListener('input', filterPrompts);
    elements.categoryFilter.addEventListener('change', filterPrompts);
    elements.filterBtn.addEventListener('click', filterPrompts);

    // Edit form submission
    elements.editForm.addEventListener('submit', handleEditSubmit);

    // New prompt form submission
    elements.newPromptForm.addEventListener('submit', handleNewPromptSubmit);

    // Event delegation for prompt actions
    elements.promptsList.addEventListener('click', handlePromptActions);
    
    // CSV export/import event listeners
    if (elements.exportCsvBtn) {
        elements.exportCsvBtn.addEventListener('click', exportPromptsToCSV);
    }
    if (elements.importCsvBtn) {
        elements.importCsvBtn.addEventListener('click', () => elements.csvFileInput.click());
    }
    if (elements.csvFileInput) {
        elements.csvFileInput.addEventListener('change', handleCSVImport);
    }
}

// Handle new prompt form submission
async function handleNewPromptSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('newTitle').value.trim();
    const text = document.getElementById('newText').value.trim();
    const category = document.getElementById('newCategory').value.trim() || 'Sin categoría';
    const saveButton = document.querySelector('#newPromptForm button[type="submit"]');
    
    if (!title || !text) {
        showError('Por favor completa los campos obligatorios');
        return;
    }

    try {
        // Show loading state
        const originalButtonText = saveButton.innerHTML;
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                titulo: title,
                texto: text,
                categoria: category
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            const errorMessage = data.error || 'Error al guardar el prompt';
            throw new Error(errorMessage);
        }

        // Reset form and close modal
        elements.newPromptForm.reset();
        elements.newPromptModal.hide();
        
        // Reload prompts
        await loadPrompts();
        showSuccess('Prompt guardado exitosamente');
    } catch (error) {
        console.error('Error al guardar el prompt:', error);
        showError(error.message || 'Error al guardar el prompt');
    } finally {
        // Reset button state
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = 'Guardar';
        }
    }
}

// Handle prompt actions (edit, delete, etc.)
function handlePromptActions(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const card = btn.closest('.prompt-card');
    const id = card?.dataset?.id;
    
    if (!id) return;

    if (btn.classList.contains('btn-edit')) {
        showEditModal(id);
    } else if (btn.classList.contains('btn-delete')) {
        if (confirm('¿Estás seguro de que deseas eliminar este prompt?')) {
            deletePrompt(id);
        }
    } else if (btn.classList.contains('btn-copy')) {
        const promptText = card.querySelector('pre').textContent;
        copyToClipboard(promptText);
    }
}

// Load prompts from API
async function loadPrompts() {
    try {
        showLoading();
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Error al cargar los prompts');
        
        prompts = await response.json();
        updateCategories();
        updateCategoryFilter();
        renderPrompts();
        updateTotalPromptsCount();
        hideLoading();
    } catch (error) {
        console.error('Error al cargar los prompts:', error);
        showError('Error al cargar los prompts');
        hideLoading();
    }
}

// Update total prompts count display
function updateTotalPromptsCount() {
    const totalPromptsElement = document.getElementById('totalPrompts');
    if (totalPromptsElement) {
        totalPromptsElement.textContent = prompts.length;
    }
}

// Update categories from loaded prompts
function updateCategories() {
    categories = new Set(prompts.map(p => p.categoria).filter(Boolean));
    updateCategoryFilter();
}

// Update category filter dropdown
function updateCategoryFilter() {
    const filter = elements.categoryFilter;
    filter.innerHTML = '<option value="">All Categories</option>';
    
    Array.from(categories).sort().forEach(category => {
        const option = new Option(category, category);
        filter.add(option);
    });
}

// Render prompts to the DOM
function renderPrompts(filteredPrompts = prompts) {
    if (filteredPrompts.length === 0) {
        elements.promptsList.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox display-1 text-muted"></i>
                <h5 class="mt-3 text-muted">No se encontraron prompts</h5>
                <p class="text-muted">¡Crea tu primer prompt para comenzar!</p>
            </div>
        `;
        return;
    }

    elements.promptsList.innerHTML = filteredPrompts.map(prompt => `
        <div class="card prompt-card mb-3" data-id="${prompt.id}">
            <div class="card-header bg-white border-0 pb-0">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title mb-1 prompt-title" style="cursor: pointer; color: var(--primary);" data-bs-toggle="collapse" data-bs-target="#prompt-${prompt.id}" aria-expanded="false">
                            <i class="bi bi-chevron-right me-2 collapse-icon"></i>
                            ${escapeHtml(prompt.titulo)}
                        </h6>
                        <div class="d-flex align-items-center gap-2 mt-2">
                            ${prompt.categoria ? `<span class="badge" style="background-color: var(--primary-light); color: white;">${escapeHtml(prompt.categoria)}</span>` : ''}
                            <small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${formatDate(prompt.creado_en)}</small>
                        </div>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${prompt.id}" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${prompt.id}" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="collapse" id="prompt-${prompt.id}">
                <div class="card-body pt-2">
                    <div class="prompt-content">
                        <h6 class="text-muted mb-2"><i class="bi bi-file-text me-1"></i>Contenido del Prompt:</h6>
                        <div class="p-3 bg-light rounded border-start border-4" style="border-color: var(--primary) !important;">
                            <pre class="mb-0" style="white-space: pre-wrap; font-family: inherit; font-size: 0.9rem;">${escapeHtml(prompt.texto)}</pre>
                        </div>
                        <div class="mt-3 d-flex justify-content-end gap-2">
                            <button class="btn btn-sm btn-outline-secondary btn-copy" title="Copiar al portapapeles">
                                <i class="bi bi-clipboard me-1"></i>Copiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners for collapse icons
    document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(element => {
        element.addEventListener('click', function() {
            const icon = this.querySelector('.collapse-icon');
            const target = document.querySelector(this.getAttribute('data-bs-target'));
            
            target.addEventListener('shown.bs.collapse', () => {
                icon.classList.remove('bi-chevron-right');
                icon.classList.add('bi-chevron-down');
            });
            
            target.addEventListener('hidden.bs.collapse', () => {
                icon.classList.remove('bi-chevron-down');
                icon.classList.add('bi-chevron-right');
            });
        });
    });
}

// Search and filter functionality
function filterPrompts() {
    const search = elements.searchInput.value.toLowerCase();
    const category = elements.categoryFilter.value;
    
    const filtered = prompts.filter(prompt => {
        const matchesSearch = !search || 
            prompt.titulo.toLowerCase().includes(search) || 
            prompt.texto.toLowerCase().includes(search);
        const matchesCategory = !category || prompt.categoria === category;
        return matchesSearch && matchesCategory;
    });
    
    renderPrompts(filtered);
}

// CRUD Operations
async function showEditModal(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('No se pudo cargar el prompt');
        
        const prompt = await response.json();
        
        // Set form values using getElementById
        document.getElementById('editPromptId').value = prompt.id;
        document.getElementById('editTitle').value = prompt.titulo || '';
        document.getElementById('editText').value = prompt.texto || '';
        
        // Set the category value if it exists in the select options
        const categorySelect = document.getElementById('editCategory');
        if (prompt.categoria) {
            const optionExists = Array.from(categorySelect.options).some(
                option => option.value === prompt.categoria
            );
            if (optionExists) {
                categorySelect.value = prompt.categoria;
            } else {
                // If the category from the prompt doesn't exist in our options, select 'otros'
                categorySelect.value = 'otros';
            }
        } else {
            categorySelect.value = '';
        }
        
        elements.editModal.show();
    } catch (error) {
        console.error('Error al cargar el prompt:', error);
        showError('No se pudo cargar el prompt para editar');
    }
}

async function deletePrompt(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar el prompt');

        await loadPrompts();
        showSuccess('Prompt eliminado exitosamente');
    } catch (error) {
        console.error('Error al eliminar el prompt:', error);
        showError('Error al eliminar el prompt');
    }
}

// Handle edit form submission
async function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('editPromptId').value;
    const title = document.getElementById('editTitle').value.trim();
    const text = document.getElementById('editText').value.trim();
    const category = document.getElementById('editCategory').value;
    const saveButton = document.querySelector('#editPromptForm button[type="submit"]');

    if (!title || !text || !category) {
        showError('Por favor completa todos los campos obligatorios');
        return;
    }

    try {
        // Show loading state
        const originalButtonText = saveButton.innerHTML;
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                titulo: title,
                texto: text,
                categoria: category
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            const errorMessage = data.error || 'Error al actualizar el prompt';
            throw new Error(errorMessage);
        }

        elements.editModal.hide();
        await loadPrompts();
        showSuccess('Prompt actualizado exitosamente');
    } catch (error) {
        console.error('Error al actualizar el prompt:', error);
        showError(error.message || 'Error al actualizar el prompt');
    } finally {
        // Reset button state
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = 'Guardar Cambios';
        }
    }
}

// Utility Functions
function escapeHtml(unsafe) {
    return unsafe?.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;') || '';
}

function truncateText(text, maxLength) {
    return text?.length > maxLength ? text.substring(0, maxLength) + '...' : text || '';
}

function formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleDateString() : '';
}

function showLoading() {
    elements.promptsList.innerHTML = '<div class="text-center">Loading...</div>';
}

function hideLoading() {
    // Loading state is cleared in renderPrompts
}

function showError(message) {
    const toastEl = document.getElementById('errorToast');
    if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        document.querySelector('#errorToast .toast-body').textContent = message;
        toast.show();
    } else {
        // Fallback if toast element doesn't exist
        alert(`Error: ${message}`);
    }
}

function showSuccess(message) {
    const toastEl = document.getElementById('successToast');
    if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        document.querySelector('#successToast .toast-body').textContent = message;
        toast.show();
    } else {
        // Fallback if toast element doesn't exist
        alert(`Éxito: ${message}`);
    }
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccess('Texto copiado al portapapeles');
        }).catch(err => {
            console.error('Error al copiar:', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showSuccess('Texto copiado al portapapeles');
        } else {
            showError('No se pudo copiar el texto');
        }
    } catch (err) {
        console.error('Error al copiar:', err);
        showError('No se pudo copiar el texto');
    } finally {
        document.body.removeChild(textArea);
    }
}

// CSV Export and Import Functions

// Export prompts to CSV
function exportPromptsToCSV() {
    if (!prompts || prompts.length === 0) {
        showError('No hay prompts para exportar');
        return;
    }

    // Create CSV content with semicolon separators
    const headers = ['ID', 'Título', 'Texto', 'Categoría', 'Fecha de Creación'];
    const csvContent = [headers.join(';')];

    prompts.forEach(prompt => {
        const row = [
            prompt.id || '',
            `"${(prompt.titulo || '').replace(/"/g, '""')}"`,
            `"${(prompt.texto || '').replace(/"/g, '""')}"`,
            `"${(prompt.categoria || '').replace(/"/g, '""')}"`,
            `"${prompt.fecha_creacion || ''}"`
        ];
        csvContent.push(row.join(';'));
    });

    // Create and download CSV file
    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `prompts_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess(`${prompts.length} prompts exportados exitosamente`);
    } else {
        showError('Tu navegador no soporta la descarga de archivos');
    }
}

// Handle CSV file import
async function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
        showError('Por favor selecciona un archivo CSV válido');
        return;
    }

    try {
        const text = await readFileAsText(file);
        const importedPrompts = parseCSV(text);
        
        if (importedPrompts.length === 0) {
            showError('No se encontraron prompts válidos en el archivo CSV');
            return;
        }

        // Confirm import
        const confirmed = confirm(
            `¿Estás seguro de que quieres importar ${importedPrompts.length} prompts?\n` +
            'Esto agregará los prompts a tu colección existente.'
        );

        if (!confirmed) {
            // Reset file input
            event.target.value = '';
            return;
        }

        // Import prompts
        await importPrompts(importedPrompts);
        
        // Reset file input
        event.target.value = '';
        
    } catch (error) {
        console.error('Error importing CSV:', error);
        showError('Error al importar el archivo CSV: ' + error.message);
        event.target.value = '';
    }
}

// Read file as text
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(new Error('Error al leer el archivo'));
        reader.readAsText(file, 'UTF-8');
    });
}

// Parse CSV content
function parseCSV(text) {
    console.log(`📄 Iniciando análisis del CSV...`);
    
    // Parse CSV properly handling multi-line quoted fields
    const records = parseCSVRecords(text);
    
    if (records.length < 2) {
        throw new Error('El archivo CSV debe tener al menos una fila de encabezados y una fila de datos');
    }

    console.log(`📄 Total registros encontrados: ${records.length} (incluyendo encabezado)`);

    // Skip header row
    const dataRecords = records.slice(1);
    const prompts = [];

    dataRecords.forEach((record, index) => {
        console.log(`\n🔍 Procesando registro ${index + 2}:`);
        
        try {
            if (record.length < 4) {
                console.warn(`❌ Registro ${index + 2} ignorado: datos insuficientes (${record.length} campos)`);
                console.log(`Campos: [${record.map(v => `"${v.substring(0, 30)}..."`).join(', ')}]`);
                return;
            }

            // Extract fields: ID, Título, Texto, Categoría, (Fecha opcional)
            const [id, titulo, texto, categoria] = record;
            console.log(`ID: "${id}", Título: "${titulo?.substring(0, 30)}...", Categoría: "${categoria}"`);
            
            // Validate required fields
            if (!titulo?.trim() || !texto?.trim()) {
                console.warn(`❌ Registro ${index + 2} ignorado: título o texto vacío`);
                console.log(`Título vacío: ${!titulo?.trim()}, Texto vacío: ${!texto?.trim()}`);
                return;
            }

            prompts.push({
                titulo: titulo.trim(),
                texto: texto.trim(),
                categoria: categoria?.trim() || 'otros'
            });
            
            console.log(`✅ Prompt ${index + 1} procesado exitosamente`);
            
        } catch (error) {
            console.error(`❌ Error en registro ${index + 2}:`, error.message);
        }
    });

    console.log(`\n📊 RESUMEN: ${prompts.length} prompts procesados de ${dataRecords.length} registros`);
    return prompts;
}

// Parse CSV records handling multi-line quoted fields
function parseCSVRecords(text) {
    const records = [];
    let currentRecord = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
        const char = text[i];
        
        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                // Escaped quote ("")
                currentField += '"';
                i += 2;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ';' && !inQuotes) {
            // Field separator found outside quotes
            currentRecord.push(currentField);
            currentField = '';
            i++;
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            // End of record (outside quotes)
            if (currentField || currentRecord.length > 0) {
                currentRecord.push(currentField);
                records.push(currentRecord);
                currentRecord = [];
                currentField = '';
            }
            // Skip \r\n combinations
            if (char === '\r' && text[i + 1] === '\n') {
                i += 2;
            } else {
                i++;
            }
        } else {
            // Regular character (including newlines inside quotes)
            currentField += char;
            i++;
        }
    }
    
    // Add the last field and record if they exist
    if (currentField || currentRecord.length > 0) {
        currentRecord.push(currentField);
        records.push(currentRecord);
    }
    
    // Filter out empty records
    return records.filter(record => record.some(field => field.trim()));
}

// Import prompts to the database
async function importPrompts(importedPrompts) {
    let successCount = 0;
    let errorCount = 0;

    showLoading();

    try {
        for (const prompt of importedPrompts) {
            try {
                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(prompt)
                });

                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                    console.error('Error importing prompt:', prompt.titulo);
                }
            } catch (error) {
                errorCount++;
                console.error('Error importing prompt:', prompt.titulo, error);
            }
        }

        // Reload prompts to refresh the list and total count
        await loadPrompts();

        // Show results
        if (successCount > 0) {
            showSuccess(`${successCount} prompts importados exitosamente${errorCount > 0 ? ` (${errorCount} errores)` : ''}`);
        } else {
            showError('No se pudo importar ningún prompt');
        }

    } catch (error) {
        console.error('Error during import:', error);
        showError('Error durante la importación: ' + error.message);
    } finally {
        hideLoading();
    }
}
