/**
 * Main Application Logic
 */

// State
const state = {
    currentUser: null, // { name, passport }
    currentSection: null, // 'loader' | 'chef' | etc
    currentExam: null, // exam object
    currentQuestionIndex: 0,
    answers: {}, // { questionId: selectedOptionIndex }
    timer: null,
    startTime: null,
    elapsedSeconds: 0
};

// DOM Elements
const elements = {
    body: document.body,
    themeToggle: document.getElementById('theme-toggle'),
    sections: {
        welcome: document.getElementById('welcome-section'),
        sectionsSelection: document.getElementById('sections-section'),
        dashboard: document.getElementById('dashboard-section'),
        exam: document.getElementById('exam-section')
    },
    loginForm: document.getElementById('login-form'),
    usernameInput: document.getElementById('username'),
    passportInput: document.getElementById('passport'),
    userGreeting: document.getElementById('user-greeting'),
    sectionsContainer: document.getElementById('sections-container'),
    modelsContainer: document.getElementById('models-container'),
    // Navigation Buttons
    backToLoginBtn: document.getElementById('back-to-login-btn'),
    backToSectionsBtn: document.getElementById('back-to-sections-btn'),
    // Exam Elements
    questionCard: document.getElementById('question-card'),
    backToModelsBtn: document.getElementById('back-to-models-btn'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    finishBtn: document.getElementById('finish-btn'),
    progressFill: document.getElementById('progress-fill'),
    questionCounter: document.getElementById('question-counter'),
    answeredCounter: document.getElementById('answered-counter'),
    completionPercentage: document.getElementById('completion-percentage'),
    // Question Navigation Sidebar
    navQuestionsList: document.getElementById('nav-questions-list'),
    questionNavSidebar: document.querySelector('.question-nav-sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    // Result Modal
    resultModal: document.getElementById('result-modal'),
    finalScore: document.getElementById('final-score'),
    resultTitle: document.getElementById('result-title'),
    resultDetails: document.getElementById('result-details'),
    timeConsumedBadge: document.getElementById('time-consumed-badge'),
    timeConsumedText: document.getElementById('time-consumed-text'),
    closeModalBtn: document.getElementById('close-modal-btn')
};

// --- Initialization ---
function init() {
    // Load Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        elements.body.classList.remove('light-mode');
        elements.body.classList.add('dark-mode');
        elements.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    // Event Listeners
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.backToLoginBtn.addEventListener('click', backToLogin);
    elements.backToSectionsBtn.addEventListener('click', backToSections);
    elements.backToModelsBtn.addEventListener('click', backToModels);
    elements.prevBtn.addEventListener('click', () => navigateQuestion(-1));
    elements.nextBtn.addEventListener('click', () => navigateQuestion(1));
    elements.finishBtn.addEventListener('click', finishExam);
    elements.closeModalBtn.addEventListener('click', () => {
        elements.resultModal.classList.add('hidden');
        showSection('dashboard');
    });

    // Sidebar Toggle for Mobile
    if (elements.sidebarToggle) {
        elements.sidebarToggle.addEventListener('click', toggleSidebar);
    }
}

// --- Theme Logic ---
function toggleTheme() {
    if (elements.body.classList.contains('light-mode')) {
        elements.body.classList.remove('light-mode');
        elements.body.classList.add('dark-mode');
        elements.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        elements.body.classList.remove('dark-mode');
        elements.body.classList.add('light-mode');
        elements.themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
}

// --- Navigation Logic ---
function showSection(sectionId) {
    // Hide all
    Object.values(elements.sections).forEach(el => {
        el.classList.remove('active-section');
        el.classList.add('hidden-section');
    });
    // Show target
    elements.sections[sectionId].classList.remove('hidden-section');
    elements.sections[sectionId].classList.add('active-section');
}

function backToLogin() {
    state.currentUser = null;
    elements.usernameInput.value = '';
    elements.passportInput.value = '';
    showSection('welcome');
}

function backToSections() {
    showSection('sectionsSelection');
}

// --- Sections Logic ---
const sectionsData = [
    { id: 'loader', title: ' عامل تحميل وتنزيل', icon: 'fa-dolly' },
    { id: 'sales', title: ' بائع', icon: 'fa-shop' },
    { id: 'driver', title: ' سائق', icon: 'fa-car' },
    { id: 'privateDriver', title: ' سائق خاص', icon: 'fa-user-tie' },
    { id: 'chef', title: ' طاهي', icon: 'fa-utensils' },
    { id: 'packaging', title: ' عامل تعبئة وتغليف', icon: 'fa-boxes-packing' },
    { id: 'shelfStocker', title: ' عامل تعبئة رفوف', icon: 'fa-boxes-stacked' },
    { id: 'manufacturing', title: ' عامل تصنيع', icon: 'fa-industry' },
    { id: 'construction', title: ' عامل بناء', icon: 'fa-trowel-bricks' },
    { id: 'productSorter', title: ' عامل فرز منتجات', icon: 'fa-filter' },
    { id: 'attar', title: ' عطار', icon: 'fa-leaf' },
    { id: 'workshopWorker', title: ' عامل ورشة', icon: 'fa-wrench' }
];

function renderSections() {
    elements.sectionsContainer.innerHTML = '';
    sectionsData.forEach(section => {
        const card = document.createElement('div');
        card.className = 'model-card';
        card.innerHTML = `
            <div class="model-icon"><i class="fa-solid ${section.icon}"></i></div>
            <h3>${section.title}</h3>
        `;
        card.addEventListener('click', () => handleSectionSelect(section.id));
        elements.sectionsContainer.appendChild(card);
    });
}

function handleSectionSelect(sectionId) {
    // Only allow implemented sections
    const allowed = ['loader', 'sales', 'driver', 'privateDriver', 'chef', 'packaging', 'shelfStocker', 'manufacturing', 'construction', 'productSorter', 'attar', 'workshopWorker'];

    if (allowed.includes(sectionId)) {
        state.currentSection = sectionId;
        renderDashboard();
        showSection('dashboard');
    } else {
        alert('هذا القسم غير متاح حالياً');
    }
}

// Helper to get data based on section
function getCurrentExamsData() {
    if (state.currentSection === 'chef') {
        return cookerExamsData;
    }
    if (state.currentSection === 'sales') {
        return sellerExamsData;
    }
    if (state.currentSection === 'driver') {
        return driverExamsData;
    }
    if (state.currentSection === 'privateDriver') {
        return privateDriverExamsData;
    }
    if (state.currentSection === 'packaging') {
        return packagingExamsData;
    }
    if (state.currentSection === 'shelfStocker') {
        return shelfStockerExamsData;
    }
    if (state.currentSection === 'manufacturing') {
        return manufacturingWorkerExamsData;
    }
    if (state.currentSection === 'construction') {
        return constructionWorkerExamsData;
    }
    if (state.currentSection === 'productSorter') {
        return productSorterExamsData;
    }
    if (state.currentSection === 'attar') {
        return attarExamsData;
    }
    if (state.currentSection === 'workshopWorker') {
        return workshopWorkerExamsData;
    }
    // Default to loader (examsData from data.js)
    return examsData;
}

// --- Login & Dashboard ---
function handleLogin(e) {
    e.preventDefault();
    const name = elements.usernameInput.value.trim();
    const passport = elements.passportInput.value.trim();

    if (name && passport) {
        state.currentUser = { name, passport };
        elements.userGreeting.innerText = `أهلاً بك، ${name}`;

        // Mock DB Save (Console)
        console.log('User Registered:', state.currentUser);

        renderSections();
        showSection('sectionsSelection');
    }
}

function renderDashboard() {
    elements.modelsContainer.innerHTML = '';
    const data = getCurrentExamsData();
    data.forEach(exam => {
        const card = document.createElement('div');
        card.className = 'model-card';
        card.innerHTML = `
            <div class="model-icon"><i class="fa-solid fa-file-signature"></i></div>
            <h3>${exam.title}</h3>
            <p>${exam.description}</p>
        `;
        card.addEventListener('click', () => startExam(exam.id));
        elements.modelsContainer.appendChild(card);
    });
}

// --- Exam Logic ---
function backToModels() {
    const confirmBack = confirm('هل تريد العودة إلى قائمة النماذج؟ سيتم فقدان إجاباتك الحالية.');
    if (confirmBack) {
        // Stop timer
        if (state.timer) clearInterval(state.timer);

        // Reset exam state
        state.currentExam = null;
        state.currentQuestionIndex = 0;
        state.answers = {};
        state.elapsedSeconds = 0;

        // Navigate back to dashboard
        showSection('dashboard');
    }
}

function startExam(examId) {
    const data = getCurrentExamsData();
    const exam = data.find(e => e.id === examId);
    if (!exam) return;

    state.currentExam = exam;
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.startTime = Date.now();
    state.elapsedSeconds = 0;

    renderQuestionNavigation();
    renderQuestion();
    updateCompletionProgress();
    startTimer();
    showSection('exam');
}

function updateCompletionProgress() {
    if (!state.currentExam) return;
    const totalQuestions = state.currentExam.questions.length;
    const answeredCount = Object.keys(state.answers).length;
    const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    if (elements.completionPercentage) {
        elements.completionPercentage.innerText = `${progressPercent}%`;
    }
    if (elements.answeredCounter) {
        elements.answeredCounter.innerText = `أجبت على ${answeredCount} من ${totalQuestions}`;
    }
    if (elements.progressFill) {
        elements.progressFill.style.width = `${progressPercent}%`;
    }
}

function renderQuestion() {
    const qIndex = state.currentQuestionIndex;
    const question = state.currentExam.questions[qIndex];
    const totalQuestions = state.currentExam.questions.length;

    // Update Counter
    if (elements.questionCounter) {
        elements.questionCounter.innerText = `سؤال ${qIndex + 1} / ${totalQuestions}`;
    }

    // Update Completion Progress
    updateCompletionProgress();

    // Render Card
    let optionsHtml = '';
    question.options.forEach((opt, idx) => {
        const isSelected = state.answers[question.id] === idx;
        optionsHtml += `
            <li class="option-item ${isSelected ? 'selected' : ''}" onclick="selectAnswer(${idx})">
                <div class="option-indicator">
                    <span class="option-dot"></span>
                </div>
                <input type="radio" name="q_opt" class="option-radio" ${isSelected ? 'checked' : ''}>
                <span class="option-text">${opt}</span>
            </li>
        `;
    });

    elements.questionCard.innerHTML = `
        <div class="question-header-row">
            <span class="question-badge"><i class="fa-solid fa-circle-question"></i> سؤال ${qIndex + 1}</span>
            <span class="question-total-badge">من أصل ${totalQuestions}</span>
        </div>
        <div class="question-text">${question.text}</div>
        <ul class="options-list">${optionsHtml}</ul>
    `;

    // Update Buttons
    elements.prevBtn.disabled = qIndex === 0;
    if (qIndex === totalQuestions - 1) {
        elements.nextBtn.classList.add('hidden');
        elements.finishBtn.classList.remove('hidden');
    } else {
        elements.nextBtn.classList.remove('hidden');
        elements.finishBtn.classList.add('hidden');
    }

    // Update Navigation Sidebar
    updateNavigationState();
}

function selectAnswer(optionIndex) {
    const q = state.currentExam.questions[state.currentQuestionIndex];
    state.answers[q.id] = optionIndex;
    renderQuestion(); // Re-render to update styling and navigation
    updateCompletionProgress();
}

function navigateQuestion(direction) {
    // Validation to force answer before next
    const currentQ = state.currentExam.questions[state.currentQuestionIndex];
    if (direction === 1 && state.answers[currentQ.id] === undefined) {
        alert('الرجاء اختيار إجابة قبل المتابعة');
        return;
    }

    state.currentQuestionIndex += direction;
    renderQuestion();
}

/**
 * Background embedded timer - tracks elapsed seconds without showing a visible clock in the exam
 */
function startTimer() {
    if (state.timer) clearInterval(state.timer);
    state.elapsedSeconds = 0;
    state.startTime = Date.now();

    state.timer = setInterval(() => {
        state.elapsedSeconds++;
    }, 1000);
}

// --- Result Logic ---
function finishExam() {
    // Validate all answered?
    const questions = state.currentExam.questions;
    const unanswered = questions.filter(q => state.answers[q.id] === undefined);

    if (unanswered.length > 0) {
        alert(`يوجد ${unanswered.length} سؤال غير مجاب عليه. الرجاء الإجابة على جميع الأسئلة.`);
        return;
    }

    if (state.timer) clearInterval(state.timer);

    // Calculate Consumed Time
    const consumedSeconds = state.elapsedSeconds > 0
        ? state.elapsedSeconds
        : Math.max(1, Math.floor((Date.now() - (state.startTime || Date.now())) / 1000));

    const hours = Math.floor(consumedSeconds / 3600);
    const minutes = Math.floor((consumedSeconds % 3600) / 60);
    const seconds = consumedSeconds % 60;

    let timeString = '';
    if (hours > 0) {
        timeString = `${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`;
    } else if (minutes > 0) {
        timeString = `${minutes} دقيقة و ${seconds} ثانية`;
    } else {
        timeString = `${seconds} ثانية`;
    }

    if (elements.timeConsumedText) {
        elements.timeConsumedText.innerText = timeString;
    }

    // 60-minute rule: if consumed time > 60 minutes (3600 seconds), fail the user even if answers are correct!
    const timeLimitExceeded = consumedSeconds > 3600;

    // Calculate Score
    let score = 0;
    let questionsReportHtml = '';

    questions.forEach((q, idx) => {
        const userAns = state.answers[q.id];
        const isCorrect = userAns === q.correctAnswer;
        if (isCorrect) score++;

        questionsReportHtml += `
            <div class="report-question-card ${isCorrect ? 'is-correct' : 'is-wrong'}">
                <div class="report-q-top">
                    <span class="report-q-index">سؤال ${idx + 1}</span>
                    <span class="report-status-badge ${isCorrect ? 'badge-success' : 'badge-danger'}">
                        ${isCorrect ? '<i class="fa-solid fa-check"></i> إجابة صحيحة' : '<i class="fa-solid fa-xmark"></i> إجابة غير صحيحة'}
                    </span>
                </div>
                <p class="report-q-title">${q.text}</p>
                <div class="report-answer-details">
                    <div class="answer-row user-ans ${isCorrect ? 'correct' : 'wrong'}">
                        <span class="answer-label">إجابتك:</span>
                        <span class="answer-val">${q.options[userAns]}</span>
                    </div>
                    ${!isCorrect ? `
                        <div class="answer-row correct-ans">
                            <span class="answer-label">الإجابة الصحيحة:</span>
                            <span class="answer-val">${q.options[q.correctAnswer]}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });

    const percent = Math.round((score / questions.length) * 100);

    // Build the result alert banner
    let alertBannerHtml = '';
    if (timeLimitExceeded) {
        alertBannerHtml = `
            <div class="result-alert-box alert-failed-time">
                <div class="alert-icon-wrap"><i class="fa-solid fa-hourglass-end"></i></div>
                <div class="alert-content">
                    <h4 class="alert-title">تم اعتبار النتيجة: غير مجتاز (تجاوزت المهلة الزمنية)</h4>
                    <p class="alert-desc">استغرقت <strong>${timeString}</strong> لإنهاء الاختبار، بينما الحد الأقصى المسموح به هو <strong>60 دقيقة فقط</strong>. طبقاً للائحة الاعتماد، يتم رسوب المتقدم عند تجاوز الوقت المحدد بغض النظر عن صحة الإجابات.</p>
                </div>
            </div>
        `;
    } else {
        alertBannerHtml = `
            <div class="result-alert-box alert-success-time">
                <div class="alert-icon-wrap"><i class="fa-solid fa-clock-rotate-left"></i></div>
                <div class="alert-content">
                    <h4 class="alert-title">تم إنهاء الاختبار ضمن الوقت المحدد</h4>
                    <p class="alert-desc">الوقت المستغرق: <strong>${timeString}</strong> (أقل من الحد الأقصى: 60 دقيقة).</p>
                </div>
            </div>
        `;
    }

    elements.finalScore.innerText = `${percent}%`;
    elements.resultDetails.innerHTML = alertBannerHtml + `<div class="report-questions-list">${questionsReportHtml}</div>`;

    // Determine Final Status
    if (timeLimitExceeded) {
        elements.resultTitle.innerText = 'غير مجتاز (تجاوزت الوقت المسموح)';
        elements.resultTitle.className = 'result-title-failed';
        elements.finalScore.parentElement.className = 'score-circle score-circle-failed';
    } else if (percent >= 67) {
        elements.resultTitle.innerText = 'ناجح ومجتاز للاختبار';
        elements.resultTitle.className = 'result-title-passed';
        elements.finalScore.parentElement.className = 'score-circle score-circle-passed';
    } else {
        elements.resultTitle.innerText = 'غير مجتاز (اخطأت بأكثر من 20 سؤال)';
        elements.resultTitle.className = 'result-title-failed';
        elements.finalScore.parentElement.className = 'score-circle score-circle-failed';
    }

    // Reset Scroll Position
    const modalContent = elements.resultModal.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;

    elements.resultModal.classList.remove('hidden');

    // Save Result to DB (Mock)
    const resultRecord = {
        user: state.currentUser,
        examId: state.currentExam.id,
        score: percent,
        consumedSeconds: consumedSeconds,
        timeLimitExceeded: timeLimitExceeded,
        passed: percent >= 67 && !timeLimitExceeded,
        answers: state.answers,
        timestamp: new Date()
    };
    console.log('Exam Result Finalized:', resultRecord);
}

// --- Question Navigation Sidebar Functions ---

/**
 * Render the question navigation sidebar with all question numbers
 */
function renderQuestionNavigation() {
    if (!elements.navQuestionsList) return;

    const questions = state.currentExam.questions;
    let navHtml = '';

    questions.forEach((q, index) => {
        navHtml += `
            <div class="nav-question-item" data-question-index="${index}" onclick="navigateToQuestion(${index})">
                سؤال ${index + 1}
            </div>
        `;
    });

    elements.navQuestionsList.innerHTML = navHtml;
    updateNavigationState();
}

/**
 * Update the navigation sidebar to reflect current question and answered states
 */
function updateNavigationState() {
    if (!elements.navQuestionsList) return;

    const questions = state.currentExam.questions;
    const navItems = elements.navQuestionsList.querySelectorAll('.nav-question-item');

    navItems.forEach((item, index) => {
        const questionId = questions[index].id;
        const isAnswered = state.answers[questionId] !== undefined;
        const isCurrent = index === state.currentQuestionIndex;

        // Remove all state classes
        item.classList.remove('answered', 'current');

        // Add appropriate classes
        if (isCurrent) {
            item.classList.add('current');
        }
        if (isAnswered) {
            item.classList.add('answered');
        }
    });
}

/**
 * Navigate directly to a specific question by index
 */
function navigateToQuestion(index) {
    if (index < 0 || index >= state.currentExam.questions.length) return;

    state.currentQuestionIndex = index;
    renderQuestion();

    // Close mobile sidebar if open
    if (window.innerWidth <= 768 && elements.questionNavSidebar) {
        elements.questionNavSidebar.classList.remove('active');
        removeSidebarOverlay();
    }
}

/**
 * Toggle sidebar visibility on mobile
 */
function toggleSidebar() {
    if (!elements.questionNavSidebar) return;

    const isActive = elements.questionNavSidebar.classList.toggle('active');

    if (isActive) {
        createSidebarOverlay();
    } else {
        removeSidebarOverlay();
    }
}

/**
 * Create overlay for mobile sidebar
 */
function createSidebarOverlay() {
    // Check if overlay already exists
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', () => {
            if (elements.questionNavSidebar) {
                elements.questionNavSidebar.classList.remove('active');
            }
            removeSidebarOverlay();
        });
        document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
}

/**
 * Remove overlay for mobile sidebar
 */
function removeSidebarOverlay() {
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode && !overlay.classList.contains('active')) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

// Expose functions globally if needed or just init
window.selectAnswer = selectAnswer; // For onclick handler in HTML
window.navigateToQuestion = navigateToQuestion; // For onclick handler in HTML
document.addEventListener('DOMContentLoaded', init);

