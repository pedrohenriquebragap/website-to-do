// Estado
let currentDate = new Date(2025, 0, 1); // Janeiro 2025
let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
let selectedDate = null;

// Elementos do DOM
const calendarGrid = document.querySelector('.calendar-grid');
const currentMonthElement = document.querySelector('.current-month');
const prevMonthButton = document.querySelector('.prev-month');
const nextMonthButton = document.querySelector('.next-month');
const appointmentModal = document.querySelector('#appointment-modal');
const appointmentForm = document.querySelector('#appointment-form');
const appointmentsContainer = document.querySelector('.appointments-container');

/**
 * Retorna o último dia do mês
 * @param {Date} date - Data de referência
 * @returns {number} Último dia do mês
 */
function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Retorna o primeiro dia da semana do mês
 * @param {Date} date - Data de referência
 * @returns {number} Dia da semana (0-6)
 */
function getFirstDayOfWeek(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

/**
 * Formata data para exibição
 * @param {Date} date - Data para formatar
 * @returns {string} Data formatada
 */
function formatDate(date) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Formata string de data
 * @param {Date} baseDate - Data base
 * @param {number} day - Dia do mês
 * @param {boolean} isOtherMonth - Se pertence a outro mês
 * @returns {string} Data formatada (YYYY-MM-DD)
 */
function formatDateString(baseDate, day, isOtherMonth) {
    const date = new Date(baseDate);
    if (isOtherMonth) {
        if (day > 20) { // Dias do mês anterior
            date.setMonth(date.getMonth() - 1);
        } else { // Dias do próximo mês
            date.setMonth(date.getMonth() + 1);
        }
    }
    date.setDate(day);
    return date.toISOString().split('T')[0];
}

/**
 * Cria elemento de dia no calendário
 * @param {number} day - Número do dia
 * @param {boolean} isOtherMonth - Se pertence a outro mês
 * @param {boolean} isToday - Se é o dia atual
 */
function createDayElement(day, isOtherMonth, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    const dateString = formatDateString(currentDate, day, isOtherMonth);
    dayElement.dataset.date = dateString;
    
    // Verifica se há compromissos neste dia
    const hasAppointment = appointments.some(app => app.date === dateString);
    if (hasAppointment) {
        dayElement.classList.add('has-appointment');
        const appointment = appointments.find(app => app.date === dateString);
        dayElement.style.setProperty('--appointment-color', appointment.color);
    }
    
    dayElement.addEventListener('click', () => openAppointmentModal(dateString));
    calendarGrid.appendChild(dayElement);
}

/**
 * Renderiza o calendário
 */
function renderCalendar() {
    const lastDay = getLastDayOfMonth(currentDate);
    const firstDayOfWeek = getFirstDayOfWeek(currentDate);
    const today = new Date();
    
    // Limpa os dias existentes
    const existingDays = calendarGrid.querySelectorAll('.calendar-day');
    existingDays.forEach(day => day.remove());

    // Atualiza o título do mês
    currentMonthElement.textContent = formatDate(currentDate);

    // Renderiza os dias do mês anterior
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const lastDayPrevMonth = getLastDayOfMonth(prevMonth);
    for (let i = 0; i < firstDayOfWeek; i++) {
        const day = lastDayPrevMonth - firstDayOfWeek + i + 1;
        createDayElement(day, true);
    }

    // Renderiza os dias do mês atual
    for (let day = 1; day <= lastDay; day++) {
        const isToday = today.getDate() === day && 
                       today.getMonth() === currentDate.getMonth() &&
                       today.getFullYear() === currentDate.getFullYear();
        createDayElement(day, false, isToday);
    }

    // Renderiza os dias do próximo mês
    const daysFromNextMonth = 42 - (firstDayOfWeek + lastDay);
    for (let day = 1; day <= daysFromNextMonth; day++) {
        createDayElement(day, true);
    }

    // Atualiza a lista de compromissos
    renderAppointments();
}

/**
 * Abre o modal de agendamento
 * @param {string} date - Data selecionada
 */
function openAppointmentModal(date) {
    selectedDate = date;
    appointmentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    appointmentModal.setAttribute('aria-hidden', 'false');
    
    document.querySelector('#appointment-date').value = new Date(date).toLocaleDateString('pt-BR');
    document.querySelector('#appointment-title').focus();
}

/**
 * Fecha o modal de agendamento
 */
function closeAppointmentModal() {
    appointmentModal.classList.remove('active');
    document.body.style.overflow = '';
    appointmentModal.setAttribute('aria-hidden', 'true');
    appointmentForm.reset();
    selectedDate = null;
}

/**
 * Salva um novo compromisso
 * @param {Event} event - Evento de submit do formulário
 */
function saveAppointment(event) {
    event.preventDefault();

    const appointment = {
        id: Date.now(),
        title: document.querySelector('#appointment-title').value,
        date: selectedDate,
        startTime: document.querySelector('#start-time').value,
        endTime: document.querySelector('#end-time').value,
        color: document.querySelector('#appointment-color').value,
        notes: document.querySelector('#appointment-notes').value
    };

    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    renderCalendar();
    closeAppointmentModal();
}

/**
 * Renderiza a lista de compromissos
 */
function renderAppointments() {
    appointmentsContainer.innerHTML = appointments
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(appointment => `
            <article class="appointment-card" style="--appointment-color: ${appointment.color}">
                <header class="appointment-header">
                    <h4 class="appointment-title">${appointment.title}</h4>
                    <time class="appointment-datetime">
                        ${new Date(appointment.date).toLocaleDateString('pt-BR')} |
                        ${appointment.startTime} - ${appointment.endTime}
                    </time>
                </header>
                <p class="appointment-notes">${appointment.notes}</p>
            </article>
        `).join('');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();

    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    appointmentForm.addEventListener('submit', saveAppointment);

    document.querySelector('.cancel-btn').addEventListener('click', closeAppointmentModal);

    appointmentModal.addEventListener('click', (event) => {
        if (event.target === appointmentModal) {
            closeAppointmentModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && appointmentModal.classList.contains('active')) {
            closeAppointmentModal();
        }
    });
});