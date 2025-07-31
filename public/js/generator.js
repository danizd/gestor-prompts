// DOM Elements
const form = document.getElementById('promptForm');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');
const savePromptBtn = document.getElementById('savePromptBtn');
const resultCard = document.getElementById('resultCard');
const generatedPrompt = document.getElementById('generatedPrompt');
const successToast = new bootstrap.Toast(document.getElementById('successToast'));

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSavedCategories();
});

// Set up event listeners
function setupEventListeners() {
    // Generate button
    generateBtn.addEventListener('click', handleGenerate);
    
    // Reset form
    resetBtn.addEventListener('click', resetForm);
    
    // Copy to clipboard
    copyBtn.addEventListener('click', copyToClipboard);
    
    // Save prompt
    savePromptBtn.addEventListener('click', savePrompt);
    
    // Allow Enter key to submit form
    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            handleGenerate();
        }
    });
}

// Handle prompt generation
function handleGenerate(e) {
    if (e) e.preventDefault();
    
    // Get form values
    const verb = document.getElementById('verb').value.trim();
    const task = document.getElementById('task').value.trim();
    const goal = document.getElementById('goal').value.trim();
    const context = document.getElementById('context').value.trim();
    const examples = document.getElementById('examples').value.trim();
    const persona = document.getElementById('persona').value.trim();
    const format = document.getElementById('format').value.trim();
    const tone = document.getElementById('tone').value.trim();
    const audience = document.getElementById('audience').value.trim();
    
    // Validate required fields
    if (!verb || !task) {
        showError('Please fill in all required fields');
        return;
    }
    
    // Build the prompt
    let prompt = `${verb} ${task}`;
    
    if (goal) prompt += ` with the goal of ${goal}`;
    if (context) prompt += `. Context: ${context}`;
    if (examples) prompt += `. Examples: ${examples}`;
    if (persona) prompt += `. Write in the persona of: ${persona}`;
    if (format) prompt += `. Format: ${format}`;
    if (tone) prompt += `. Tone: ${tone}`;
    if (audience) prompt += `. Target audience: ${audience}`;
    
    // Display the generated prompt
    generatedPrompt.textContent = prompt;
    resultCard.classList.remove('d-none');
    
    // Scroll to the result
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

// Reset the form
function resetForm() {
    form.reset();
    resultCard.classList.add('d-none');
    generatedPrompt.textContent = '';
}

// Copy prompt to clipboard
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(generatedPrompt.textContent);
        showSuccess('Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy:', err);
        showError('Failed to copy to clipboard');
    }
}

// Save prompt to the database
async function savePrompt() {
    const category = document.getElementById('category').value.trim() || 'Uncategorized';
    const titulo = document.getElementById('task').value.trim() || 'Untitled Prompt';
    const texto = generatedPrompt.textContent;
    
    if (!texto) {
        showError('No prompt to save. Please generate a prompt first.');
        return;
    }
    
    try {
        const response = await fetch('/api/prompts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                titulo: titulo,
                texto: texto,
                categoria: category
            }),
        });
        
        if (!response.ok) throw new Error('Failed to save prompt');
        
        // Show success message
        successToast.show();
        
        // Update categories in the dropdown
        loadSavedCategories();
        
    } catch (error) {
        console.error('Error saving prompt:', error);
        showError('Failed to save prompt');
    }
}

// Load saved categories for suggestions
async function loadSavedCategories() {
    try {
        const response = await fetch('/api/prompts');
        if (!response.ok) return;
        
        const prompts = await response.json();
        const categories = new Set(prompts.map(p => p.categoria).filter(Boolean));
        
        // Update the category datalist
        const datalist = document.getElementById('categorySuggestions') || 
                         createCategoryDatalist();
                          
        datalist.innerHTML = Array.from(categories)
            .map(cat => `<option value="${escapeHtml(cat)}">`)
            .join('');
            
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Create category datalist if it doesn't exist
function createCategoryDatalist() {
    const input = document.getElementById('category');
    const datalist = document.createElement('datalist');
    datalist.id = 'categorySuggestions';
    input.setAttribute('list', 'categorySuggestions');
    input.parentNode.insertBefore(datalist, input.nextSibling);
    return datalist;
}

// Utility functions
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger mt-3';
    alert.textContent = message;
    form.prepend(alert);
    setTimeout(() => alert.remove(), 5000);
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 m-3';
    toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-success text-white">
                <strong class="me-auto">Success</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
