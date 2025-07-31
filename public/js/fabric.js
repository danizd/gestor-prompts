document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('fabric-prompts-container');
    const totalPromptsCount = document.getElementById('total-prompts-count');
    const searchInput = document.getElementById('search-input');

    const categoryIcons = {
        'Formato y Visualización': '<i class="bi bi-display"></i>',
        'Audiovisual': '<i class="bi bi-film"></i>',
        'Negocios': '<i class="bi bi-briefcase-fill"></i>',
        'Programación': '<i class="bi bi-code-slash"></i>',
        'Comunicación': '<i class="bi bi-chat-dots-fill"></i>',
        'Creatividad': '<i class="bi bi-pencil-fill"></i>',
        'Análisis de datos': '<i class="bi bi-bar-chart-fill"></i>',
        'Diseño': '<i class="bi bi-palette-fill"></i>',
        'Educación': '<i class="bi bi-book-fill"></i>',
        'Email': '<i class="bi bi-envelope-fill"></i>',
        'RRHH': '<i class="bi bi-people-fill"></i>',
        'Legal': '<i class="bi bi-gavel"></i>',
        'Marketing': '<i class="bi bi-megaphone-fill"></i>',
        'Productividad': '<i class="bi bi-graph-up-arrow"></i>',
        'Gestión de proyectos': '<i class="bi bi-kanban-fill"></i>',
        'Investigación': '<i class="bi bi-search"></i>',
        'Ventas': '<i class="bi bi-tags-fill"></i>',
        'SEO': '<i class="bi bi-google"></i>',
        'Redes sociales': '<i class="bi bi-share-fill"></i>',
        'Estrategia': '<i class="bi bi-flag-fill"></i>',
        'Soporte': '<i class="bi bi-headset"></i>',
        'Traducción': '<i class="bi bi-translate"></i>',
        'Otros': '<i class="bi bi-three-dots"></i>'
    };

    let allPrompts = [];

    fetch('/json/prompts_fabric.json')
        .then(response => response.json())
        .then(prompts => {
            allPrompts = prompts;
            totalPromptsCount.textContent = allPrompts.length;
            renderPrompts(allPrompts);

            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredPrompts = allPrompts.filter(prompt => {
                    const title = prompt.titulo_espanol.toLowerCase();
                    const content = prompt.system.toLowerCase();
                    return title.includes(searchTerm) || content.includes(searchTerm);
                });
                renderPrompts(filteredPrompts);
            });
        });

    function renderPrompts(prompts) {
        container.innerHTML = '';

        const categories = prompts.reduce((acc, prompt) => {
            const category = prompt.categoria;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(prompt);
            return acc;
        }, {});

        const accordion = document.createElement('div');
        accordion.classList.add('accordion');
        accordion.id = 'fabric-accordion';

        for (const categoryName in categories) {
            const categoryPrompts = categories[categoryName];
            const categoryKey = categoryName.replace(/\s+/g, '-').toLowerCase();

            const categoryElement = document.createElement('div');
            categoryElement.classList.add('accordion-item', 'fabric-category-item');

            const categoryHeader = document.createElement('h2');
            categoryHeader.classList.add('accordion-header');
            categoryHeader.id = `heading-${categoryKey}`;

            const categoryButton = document.createElement('button');
            categoryButton.classList.add('accordion-button', 'collapsed', 'fabric-category-button');
            categoryButton.type = 'button';
            categoryButton.dataset.bsToggle = 'collapse';
            categoryButton.dataset.bsTarget = `#collapse-${categoryKey}`;
            categoryButton.ariaExpanded = 'false';
            categoryButton.ariaControls = `collapse-${categoryKey}`;
            categoryButton.innerHTML = `
                <span class="category-icon">${categoryIcons[categoryName] || '<i class="bi bi-box"></i>'}</span>
                <span>${categoryName} <span class="badge bg-secondary">${categoryPrompts.length}</span></span>
            `;

            categoryHeader.appendChild(categoryButton);

            const categoryCollapse = document.createElement('div');
            categoryCollapse.id = `collapse-${categoryKey}`;
            categoryCollapse.classList.add('accordion-collapse', 'collapse');
            categoryCollapse.setAttribute('data-bs-parent', '#fabric-accordion');

            const categoryBody = document.createElement('div');
            categoryBody.classList.add('accordion-body', 'fabric-category-body');

            categoryPrompts.forEach(prompt => {
                const promptCard = document.createElement('div');
                promptCard.classList.add('prompt-card-fabric');

                const promptHeader = document.createElement('div');
                promptHeader.classList.add('prompt-header-fabric');
                promptHeader.setAttribute('data-bs-toggle', 'collapse');
                promptHeader.setAttribute('data-bs-target', `#collapse-prompt-${prompt.title}`);
                promptHeader.innerHTML = `
                    <span class="prompt-title-fabric">${prompt.titulo_espanol}</span>
                    <i class="bi bi-chevron-down collapse-icon-fabric"></i>
                `;

                const promptCollapse = document.createElement('div');
                promptCollapse.id = `collapse-prompt-${prompt.title}`;
                promptCollapse.classList.add('accordion-collapse', 'collapse');

                const promptBody = document.createElement('div');
                promptBody.classList.add('prompt-body-fabric');

                const description = document.createElement('p');
                description.classList.add('prompt-description-fabric');
                description.textContent = prompt.descripcion_español;

                const promptContent = document.createElement('pre');
                promptContent.classList.add('prompt-content-fabric');
                promptContent.textContent = prompt.system;

                const copyButton = document.createElement('button');
                copyButton.classList.add('btn', 'btn-primary', 'btn-sm', 'copy-btn-fabric');
                copyButton.innerHTML = '<i class="bi bi-clipboard"></i> Copiar';
                copyButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(prompt.system);
                    copyButton.innerHTML = '<i class="bi bi-check-lg"></i> ¡Copiado!';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="bi bi-clipboard"></i> Copiar';
                    }, 2000);
                });

                promptBody.appendChild(description);
                promptBody.appendChild(promptContent);
                promptBody.appendChild(copyButton);
                promptCollapse.appendChild(promptBody);
                promptCard.appendChild(promptHeader);
                promptCard.appendChild(promptCollapse);
                categoryBody.appendChild(promptCard);
            });

            categoryCollapse.appendChild(categoryBody);
            categoryElement.appendChild(categoryHeader);
            categoryElement.appendChild(categoryCollapse);
            accordion.appendChild(categoryElement);
        }
        container.appendChild(accordion);
    }
});