// Seleção de elementos
const addButton = document.querySelector('.add-reminder-btn');
const modal = document.querySelector('#reminder-modal');
const confirmModal = document.querySelector('#confirm-modal');
const form = document.querySelector('#reminder-form');
const remindersContainer = document.querySelector('.reminders-container');
const cancelButton = document.querySelector('.cancel-btn');
const emojiButtons = document.querySelectorAll('.emoji-picker button');

// Estado
let selectedEmoji = '📝';
let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
let reminderToDelete = null;

/**
 * Inicializa a data atual no formulário
 */
function initializeDateField() {
    const dateField = document.querySelector('#reminder-date');
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    dateField.value = formattedDate;
}

/**
 * Abre o modal e inicializa os campos
 */
function openModal() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    initializeDateField();
    document.querySelector('#reminder-name').focus();
}

/**
 * Fecha o modal e limpa os campos
 */
function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    form.reset();
    selectedEmoji = '📝';
    updateEmojiSelection();
}

/**
 * Abre o modal de confirmação de exclusão
 * @param {string} reminderId - ID do lembrete a ser excluído
 */
function openConfirmModal(reminderId) {
    reminderToDelete = reminderId;
    confirmModal.classList.add('active');
    confirmModal.setAttribute('aria-hidden', 'false');
    confirmModal.querySelector('.confirm-btn').focus();
}

/**
 * Fecha o modal de confirmação
 */
function closeConfirmModal() {
    confirmModal.classList.remove('active');
    confirmModal.setAttribute('aria-hidden', 'true');
    reminderToDelete = null;
}

/**
 * Exclui um lembrete
 */
function deleteReminder() {
    if (!reminderToDelete) return;
    
    reminders = reminders.filter(reminder => reminder.id !== Number(reminderToDelete));
    localStorage.setItem('reminders', JSON.stringify(reminders));
    
    const cardElement = document.querySelector(`[data-id="${reminderToDelete}"]`);
    if (cardElement) {
        cardElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            renderReminders();
            closeConfirmModal();
        }, 300);
    }
}

/**
 * Atualiza a seleção visual dos emojis
 */
function updateEmojiSelection() {
    emojiButtons.forEach(button => {
        button.classList.toggle('selected', 
            button.dataset.emoji === selectedEmoji);
    });
}

/**
 * Salva um novo lembrete
 * @param {Event} event - Evento de submit do formulário
 */
function saveReminder(event) {
    event.preventDefault();

    const reminder = {
        id: Date.now(),
        name: document.querySelector('#reminder-name').value,
        date: document.querySelector('#reminder-date').value,
        color: document.querySelector('#reminder-color').value,
        emoji: selectedEmoji,
        content: document.querySelector('#reminder-content').value
    };

    reminders.unshift(reminder);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    
    renderReminders();
    closeModal();
}

/**
 * Renderiza todos os lembretes na tela
 */
function renderReminders() {
    remindersContainer.innerHTML = reminders.map(reminder => `
        <article class="reminder-card" style="--reminder-color: ${reminder.color}" data-id="${reminder.id}">
            <header class="reminder-header">
                <span class="reminder-emoji" role="img" aria-label="Emoji do lembrete">
                    ${reminder.emoji}
                </span>
                <h3 class="reminder-title">${reminder.name}</h3>
            </header>
            <time class="reminder-date" datetime="${reminder.date}">
                ${reminder.date}
            </time>
            <p class="reminder-content">${reminder.content}</p>
            <button class="delete-btn" aria-label="Excluir lembrete" data-id="${reminder.id}">
                🗑️
            </button>
        </article>
    `).join('');
}

/**
 * Manipulador para cliques fora do modal
 * @param {Event} event - Evento de clique
 */
function handleOutsideClick(event) {
    if (event.target === modal) {
        closeModal();
    }
}

/**
 * Manipulador para tecla ESC
 * @param {KeyboardEvent} event - Evento de teclado
 */
function handleKeyDown(event) {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    } else if (event.key === 'Escape' && confirmModal.classList.contains('active')) {
        closeConfirmModal();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicialização
    renderReminders();
    updateEmojiSelection();

    // Listeners para o modal principal
    addButton.addEventListener('click', openModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    // Listeners para emojis
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedEmoji = button.dataset.emoji;
            updateEmojiSelection();
        });
    });

    // Listener para o formulário
    form.addEventListener('submit', saveReminder);

    // Listeners para exclusão
    remindersContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const reminderId = deleteBtn.dataset.id;
            openConfirmModal(reminderId);
        }
    });

    // Listeners para o modal de confirmação
    confirmModal.querySelector('.confirm-btn').addEventListener('click', deleteReminder);
    confirmModal.querySelector('.cancel-confirm-btn').addEventListener('click', closeConfirmModal);
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            closeConfirmModal();
        }
    });
});