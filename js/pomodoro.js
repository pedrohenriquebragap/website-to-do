document.addEventListener('DOMContentLoaded', () => {
    // Configurações do Timer
    const TIMER_SETTINGS = {
        pomodoro: 25 * 60, // 25 minutos
        shortBreak: 5 * 60,  // 5 minutos
        longBreak: 15 * 60   // 15 minutos
    };

    // Estado do Timer
    let timeLeft = TIMER_SETTINGS.pomodoro;
    let timerId = null;
    let currentMode = 'pomodoro';
    let timerStartValue;

    // Elementos do DOM
    const timerDisplay = document.querySelector('.timer-display');
    const timerProgress = document.querySelector('.timer-progress');
    const startBtn = document.querySelector('.start-btn');
    const pauseBtn = document.querySelector('.pause-btn');
    const resetBtn = document.querySelector('.reset-btn');
    const modeButtons = document.querySelectorAll('.timer-controls .btn');
    const alarm = document.querySelector('#timer-alarm');

    // Circunferência do círculo de progresso
    const CIRCUMFERENCE = 565.48; // 2 * π * 90 (raio)

    /**
     * Formata o tempo em minutos e segundos
     * @param {number} time - Tempo em segundos
     * @returns {string} Tempo formatado (mm:ss)
     */
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Atualiza o círculo de progresso
     * @param {number} timeLeft - Tempo restante em segundos
     */
    function updateProgress(timeLeft) {
        const progress = timeLeft / TIMER_SETTINGS[currentMode];
        const offset = CIRCUMFERENCE * (1 - progress);
        timerProgress.style.strokeDashoffset = offset;
    }

    /**
     * Inicia o timer
     */
    function startTimer() {
        if (timerId) return;
        
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');

        timerId = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);
            updateProgress(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(timerId);
                timerId = null;
                timerDisplay.classList.add('time-up');
                alarm.play();
                startBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
            }
        }, 1000);
    }

    /**
     * Pausa o timer
     */
    function pauseTimer() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            startBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
        }
    }

    /**
     * Reseta o timer para o valor inicial do modo atual
     */
    function resetTimer() {
        clearInterval(timerId);
        timerId = null;
        timeLeft = TIMER_SETTINGS[currentMode];
        timerStartValue = timeLeft; // Initialize timerStartValue here
        timerDisplay.textContent = formatTime(timeLeft);
        timerDisplay.classList.remove('time-up');
        updateProgress(timeLeft);
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
    }

    /**
     * Muda o modo do timer
     * @param {string} mode - Novo modo ('pomodoro', 'shortBreak', 'longBreak')
     */
    function changeMode(mode) {
        if (!TIMER_SETTINGS[mode]) return;
        
        currentMode = mode;
        modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        resetTimer();
    }

    // Inicialização
    timerDisplay.textContent = formatTime(timeLeft);
    timerProgress.style.strokeDasharray = CIRCUMFERENCE;
    updateProgress(timeLeft);

    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Event Listeners para os botões de modo
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;
            if (mode) {
                changeMode(mode);
            }
        });
    });

    // Fechar notificação sonora
    alarm.addEventListener('ended', () => {
        timerDisplay.classList.remove('time-up');
    });
});