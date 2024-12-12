document.addEventListener('DOMContentLoaded', () => {
    // Estado
    let lists = JSON.parse(localStorage.getItem('lists') || '[]');
    let listToDelete = null;

    // Elementos do DOM
    const addButton = document.querySelector('.add-list-btn');
    const modal = document.querySelector('#list-modal');
    const confirmModal = document.querySelector('#confirm-modal');
    const form = document.querySelector('#list-form');
    const listsContainer = document.querySelector('.lists-container');
    const itemsContainer = document.querySelector('.items-container');
    const addItemButton = document.querySelector('#add-item-btn');
    const cancelButton = document.querySelector('.cancel-btn');

    /**
     * Abre o modal
     */
    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.querySelector('#list-title').focus();
        
        // Limpa os itens existentes
        itemsContainer.innerHTML = '';
        // Adiciona o primeiro item
        addItemInput();
    }

    /**
     * Fecha o modal
     */
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        form.reset();
    }

    /**
     * Abre o modal de confirmação
     * @param {string} listId - ID da lista a ser excluída
     */
    function openConfirmModal(listId) {
        listToDelete = listId;
        confirmModal.classList.add('active');
        confirmModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Fecha o modal de confirmação
     */
    function closeConfirmModal() {
        confirmModal.classList.remove('active');
        confirmModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        listToDelete = null;
    }

    /**
     * Adiciona um novo campo de input para item
     */
    function addItemInput() {
        if (itemsContainer.children.length >= 10) {
            alert('Máximo de 10 itens permitido');
            return;
        }

        const itemGroup = document.createElement('div');
        itemGroup.className = 'item-input-group';
        itemGroup.innerHTML = `
            <input type="text" class="item-input-field" 
                   placeholder="Digite um item" required>
            <button type="button" class="remove-item-btn" aria-label="Remover item">
                ×
            </button>
        `;

        itemsContainer.appendChild(itemGroup);
        itemGroup.querySelector('.item-input-field').focus();

        // Event listener para remover item
        itemGroup.querySelector('.remove-item-btn').addEventListener('click', () => {
            if (itemsContainer.children.length > 1) {
                itemGroup.remove();
            }
        });
    }

    /**
     * Salva uma nova lista
     * @param {Event} event - Evento de submit do formulário
     */
    function saveList(event) {
        event.preventDefault();

        const title = document.querySelector('#list-title').value;
        const items = Array.from(itemsContainer.querySelectorAll('.item-input-field'))
            .map(input => ({
                text: input.value,
                checked: false
            }))
            .filter(item => item.text.trim() !== '');

        const list = {
            id: Date.now(),
            title,
            items
        };

        lists.unshift(list);
        localStorage.setItem('lists', JSON.stringify(lists));
        
        renderLists();
        closeModal();
    }

    /**
     * Renderiza todas as listas
     */
    function renderLists() {
        listsContainer.innerHTML = lists.map(list => `
            <div class="list-card" data-id="${list.id}">
                <h3 class="list-title">${list.title}</h3>
                <ul class="list-items">
                    ${list.items.map(item => `
                        <li class="list-item">
                            <div class="item-checkbox ${item.checked ? 'checked' : ''}"
                                 role="checkbox"
                                 aria-checked="${item.checked}"
                                 tabindex="0">
                            </div>
                            <span class="item-text ${item.checked ? 'checked' : ''}">${item.text}</span>
                        </li>
                    `).join('')}
                </ul>
                <button class="delete-list-btn" aria-label="Excluir lista">
                    🗑️
                </button>
            </div>
        `).join('');

        // Adiciona event listeners para os checkboxes
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', handleCheckboxClick);
            checkbox.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCheckboxClick.call(checkbox);
                }
            });
        });

        // Adiciona event listeners para os botões de excluir
        document.querySelectorAll('.delete-list-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const listId = btn.closest('.list-card').dataset.id;
                openConfirmModal(listId);
            });
        });
    }

    /**
     * Manipula o clique em um checkbox
     */
    function handleCheckboxClick() {
        const listCard = this.closest('.list-card');
        const listId = Number(listCard.dataset.id);
        const itemText = this.nextElementSibling.textContent;

        // Encontra e atualiza o item na lista
        const list = lists.find(l => l.id === listId);
        if (list) {
            const item = list.items.find(i => i.text === itemText);
            if (item) {
                item.checked = !item.checked;
                this.classList.toggle('checked');
                this.nextElementSibling.classList.toggle('checked');
                this.setAttribute('aria-checked', item.checked);
                localStorage.setItem('lists', JSON.stringify(lists));
            }
        }
    }

    /**
     * Exclui uma lista
     */
    function deleteList() {
        if (!listToDelete) return;

        lists = lists.filter(list => list.id !== Number(listToDelete));
        localStorage.setItem('lists', JSON.stringify(lists));
        
        const listElement = document.querySelector(`[data-id="${listToDelete}"]`);
        if (listElement) {
            listElement.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                renderLists();
                closeConfirmModal();
            }, 300);
        }
    }

    // Event Listeners
    addButton.addEventListener('click', openModal);
    addItemButton.addEventListener('click', addItemInput);
    form.addEventListener('submit', saveList);
    cancelButton.addEventListener('click', closeModal);

    // Event Listeners para o modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Event Listeners para o modal de confirmação
    confirmModal.querySelector('.confirm-btn').addEventListener('click', deleteList);
    confirmModal.querySelector('.cancel-confirm-btn').addEventListener('click', closeConfirmModal);
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) closeConfirmModal();
    });

    // Event Listener para tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) closeModal();
            if (confirmModal.classList.contains('active')) closeConfirmModal();
        }
    });

    // Inicialização
    renderLists();
});