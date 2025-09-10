// Calendar functionality for mood tracking
class MoodCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedMood = null;
        this.moods = JSON.parse(localStorage.getItem('moodData')) || {};

        this.initializeElements();
        this.bindEvents();
        this.renderCalendar();
    }

    initializeElements() {
        this.monthYearEl = document.getElementById('monthYear');
        this.calendarDaysEl = document.getElementById('calendarDays');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.moodModal = document.getElementById('moodModal');
        this.modalDateEl = document.getElementById('modalDate');
        this.saveMoodBtn = document.getElementById('saveMood');
        this.cancelMoodBtn = document.getElementById('cancelMood');
        this.deleteMoodBtn = document.getElementById('deleteMood');
        this.moodOptions = document.querySelectorAll('.mood-option');
    }

    bindEvents() {
        this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn.addEventListener('click', () => this.nextMonth());
        this.saveMoodBtn.addEventListener('click', () => this.saveMood());
        this.cancelMoodBtn.addEventListener('click', () => this.closeMoodModal());
        this.deleteMoodBtn.addEventListener('click', () => this.deleteMood());

        // Mood option selection
        this.moodOptions.forEach(option => {
            option.addEventListener('click', () => this.selectMood(option));
        });

        // Close modal when clicking outside
        this.moodModal.addEventListener('click', (e) => {
            if (e.target === this.moodModal) {
                this.closeMoodModal();
            }
        });
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Set month/year title
        this.monthYearEl.textContent = this.currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        // Clear previous calendar
        this.calendarDaysEl.innerHTML = '';

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const dayEl = this.createDayElement(dayNum, true, year, month - 1);
            this.calendarDaysEl.appendChild(dayEl);
        }

        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = this.createDayElement(day, false, year, month);
            this.calendarDaysEl.appendChild(dayEl);
        }

        // Next month's leading days
        const totalCells = this.calendarDaysEl.children.length;
        const remainingCells = 42 - totalCells; // 6 rows × 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const dayEl = this.createDayElement(day, true, year, month + 1);
            this.calendarDaysEl.appendChild(dayEl);
        }
    }

    createDayElement(dayNum, isOtherMonth, year, month) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');

        if (isOtherMonth) {
            dayEl.classList.add('other-month');
        }

        // Check if it's today
        const today = new Date();
        if (year === today.getFullYear() &&
            month === today.getMonth() &&
            dayNum === today.getDate() &&
            !isOtherMonth) {
            dayEl.classList.add('today');
        }

        // Create day number element
        const dayNumberEl = document.createElement('div');
        dayNumberEl.classList.add('day-number');
        dayNumberEl.textContent = dayNum;
        dayEl.appendChild(dayNumberEl);

        // Check for mood data
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        if (this.moods[dateKey]) {
            dayEl.classList.add('has-mood');
            const moodEl = document.createElement('div');
            moodEl.classList.add('day-mood');
            moodEl.textContent = this.moods[dateKey].emoji;
            dayEl.appendChild(moodEl);
        }

        // Add click event
        if (!isOtherMonth) {
            dayEl.addEventListener('click', () => {
                this.openMoodModal(year, month, dayNum);
            });
        }

        return dayEl;
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
        this.addTransitionEffect();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
        this.addTransitionEffect();
    }

    addTransitionEffect() {
        this.calendarDaysEl.style.opacity = '0';
        setTimeout(() => {
            this.calendarDaysEl.style.opacity = '1';
        }, 150);
    }

    openMoodModal(year, month, day) {
        this.selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Set modal date
        const date = new Date(year, month, day);
        this.modalDateEl.textContent = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Clear previous selection
        this.moodOptions.forEach(option => option.classList.remove('selected'));
        this.selectedMood = null;

        // Check if date already has a mood
        if (this.moods[this.selectedDate]) {
            const existingMood = this.moods[this.selectedDate].mood;
            const existingOption = document.querySelector(`[data-mood="${existingMood}"]`);
            if (existingOption) {
                existingOption.classList.add('selected');
                this.selectedMood = {
                    mood: existingMood,
                    emoji: existingOption.dataset.emoji
                };
            }
            this.deleteMoodBtn.style.display = 'inline-block';
        } else {
            this.deleteMoodBtn.style.display = 'none';
        }

        // Show modal
        this.moodModal.classList.add('active');
        this.createFloatingEmojis();
    }

    closeMoodModal() {
        this.moodModal.classList.remove('active');
        this.selectedDate = null;
        this.selectedMood = null;
    }

    selectMood(option) {
        // Clear previous selection
        this.moodOptions.forEach(opt => opt.classList.remove('selected'));

        // Select current option
        option.classList.add('selected');
        this.selectedMood = {
            mood: option.dataset.mood,
            emoji: option.dataset.emoji
        };

        // Add selection animation
        option.style.animation = 'none';
        setTimeout(() => {
            option.style.animation = 'bounce 0.5s ease-in-out';
        }, 10);
    }

    saveMood() {
        if (this.selectedMood && this.selectedDate) {
            this.moods[this.selectedDate] = {
                ...this.selectedMood,
                timestamp: Date.now()
            };

            // Save to localStorage
            localStorage.setItem('moodData', JSON.stringify(this.moods));

            // Show success notification
            this.showNotification(`Mood saved for ${this.selectedDate}! 💕`, 'success');

            // Close modal and refresh calendar
            this.closeMoodModal();
            this.renderCalendar();

            // Add celebration effect
            this.createCelebrationEffect();
        } else {
            this.showNotification('Please select a mood first!', 'error');
        }
    }

    deleteMood() {
        if (this.selectedDate && this.moods[this.selectedDate]) {
            delete this.moods[this.selectedDate];
            localStorage.setItem('moodData', JSON.stringify(this.moods));

            this.showNotification(`Mood deleted for ${this.selectedDate}`, 'info');
            this.closeMoodModal();
            this.renderCalendar();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#51cf66' : '#ff69b4'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 20px;
            box-shadow: 0 12px 40px rgba(255, 105, 180, 0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: 500;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    createFloatingEmojis() {
        const emojis = ['💕', '🌟', '✨', '🦋', '🌸'];
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                emoji.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${window.innerHeight + 50}px;
                    font-size: 1.5rem;
                    pointer-events: none;
                    z-index: 9999;
                    animation: floatUp 4s ease-out forwards;
                `;
                document.body.appendChild(emoji);

                setTimeout(() => {
                    if (emoji.parentNode) {
                        emoji.parentNode.removeChild(emoji);
                    }
                }, 4000);
            }, i * 200);
        }
    }

    createCelebrationEffect() {
        const celebration = ['🎉', '🎊', '✨', '🌟', '💫'];
        const center = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };

        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = celebration[Math.floor(Math.random() * celebration.length)];
                const angle = (i * 30) * Math.PI / 180;
                const distance = 100 + Math.random() * 100;

                particle.style.cssText = `
                    position: fixed;
                    left: ${center.x}px;
                    top: ${center.y}px;
                    font-size: ${1 + Math.random()}rem;
                    pointer-events: none;
                    z-index: 9999;
                    animation: explode 2s ease-out forwards;
                    --end-x: ${Math.cos(angle) * distance}px;
                    --end-y: ${Math.sin(angle) * distance}px;
                `;

                document.body.appendChild(particle);

                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 2000);
            }, i * 50);
        }
    }
}

// Dynamically inject all necessary CSS animations and styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translateY(0) scale(0.5) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translateY(-200px) scale(1.2) rotate(360deg);
        }
    }
    
    @keyframes explode {
        0% {
            opacity: 1;
            transform: translate(0, 0) scale(0.5);
        }
        100% {
            opacity: 0;
            transform: translate(var(--end-x), var(--end-y)) scale(1.5);
        }
    }
    
    @keyframes welcomeFloat {
        0% {
            opacity: 0;
            transform: translateY(50px) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translateY(-20px) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.8) rotate(360deg);
        }
    }

    .calendar-days {
        transition: opacity 0.3s ease-in-out;
    }
    
    .mood-option {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .mood-option:hover {
        transform: translateY(-5px) scale(1.05);
    }
    
    .mood-option.selected {
        background: linear-gradient(135deg, #ffb6c1, #ff69b4);
        color: white;
        box-shadow: 0 8px 30px rgba(255, 105, 180, 0.3);
    }
    
    .calendar-day {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .calendar-day:hover:not(.other-month) {
        background: linear-gradient(135deg, #ffe4e1, #ffb6c1);
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(255, 105, 180, 0.2);
    }
    
    .calendar-day.today {
        animation: todayPulse 2s ease-in-out infinite;
    }
    
    @keyframes todayPulse {
        0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 105, 180, 0.7);
        }
        50% {
            box-shadow: 0 0 0 10px rgba(255, 105, 180, 0);
        }
    }
    
    .has-mood .day-mood {
        animation: moodBounce 1s ease-in-out;
    }
    
    @keyframes moodBounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        60% {
            transform: translateY(-5px);
        }
    }
`;
document.head.appendChild(styleSheet);

// Initialize the app once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize mobile menu toggle if it exists
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            nav.classList.toggle('active');
        });
    }

    // Initialize the main mood calendar application
    new MoodCalendar();

    // Trigger a welcome animation on page load
    setTimeout(() => {
        const welcomeEmojis = ['🌱', '💕', '✨', '🌟', '🦋'];
        welcomeEmojis.forEach((emoji, index) => {
            setTimeout(() => {
                const el = document.createElement('div');
                el.textContent = emoji;
                el.style.cssText = `
                    position: fixed;
                    left: ${20 + index * 80}px;
                    top: 150px;
                    font-size: 2rem;
                    pointer-events: none;
                    z-index: 1000;
                    animation: welcomeFloat 3s ease-out forwards;
                `;
                document.body.appendChild(el);

                setTimeout(() => {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }, 3000);
            }, index * 200);
        });
    }, 500);



    // ===== START: CHATBOT LOGIC (User Input Only) =====
const chatbotContainer = document.getElementById('chatbotContainer');
const startChatBtn = document.getElementById('startChatBtn');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const closeChatbotBtn = document.getElementById('closeChatbotBtn');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSendBtn = document.getElementById('chatbotSendBtn');

/**
 * Toggles the visibility of the chatbot window with a CSS class.
 */
const toggleChatbot = () => {
    chatbotContainer.classList.toggle('active');
};

// Event listeners to open and close the chatbot
startChatBtn.addEventListener('click', toggleChatbot);
chatToggleBtn.addEventListener('click', toggleChatbot);
closeChatbotBtn.addEventListener('click', toggleChatbot);

/**
 * Creates a new message bubble and adds it to the chat window.
 * @param {string} message - The text content of the message.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 */
const addMessage = (message, sender) => {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add(`${sender}-message`);

    const messageBubble = document.createElement('p');
    messageBubble.textContent = message;

    messageWrapper.appendChild(messageBubble);
    chatbotMessages.appendChild(messageWrapper);

    // Automatically scroll to the latest message
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
};

/**
 * Handles the sending of a message from the user input field.
 * This version ONLY displays the user's message.
 */
const handleSendMessage = () => {
    const message = chatbotInput.value;
    if (message.trim() === "") return; // Do nothing if the input is empty

    // Add the user's message to the chat window
    addMessage(message, 'user');

    // Clear the input field after sending
    chatbotInput.value = '';
};

// Event listener for the send button
chatbotSendBtn.addEventListener('click', handleSendMessage);

// Event listener for pressing "Enter" in the input field
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// ===== END: CHATBOT LOGIC =====
    
    console.log('🌱💕 Mood Calendar loaded! Ready to track your emotional journey! ✨');
});