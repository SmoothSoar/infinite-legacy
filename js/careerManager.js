// Universal CareerManager.js - Works Across All Pages
class CareerManager {
    // Configuration
    static debug = true;
    static initialized = false;
    
    // State management
    static gameState = null;
    static careersData = [];
    static selectedJob = null;
    static currentCharacterId = null;
    static storageKey = null;
    
    // UI elements cache (only used on career page)
    static elements = {};
    
    // Event listeners for cleanup
    static eventListeners = [];
    
    // Constants
    static PERFORMANCE_RANGE = { min: 0, max: 100 };
    static DEFAULT_SATISFACTION = 50;
    static MIN_SATISFACTION = 0;
    static MAX_SATISFACTION = 100;
    static PROMOTION_THRESHOLD = 80;
    static BASE_PERFORMANCE_INCREASE = 1;
    static MAX_PERFORMANCE_INCREASE = 5;

    /**
     * Initializes the CareerManager system
     */
    static async init() {
        try {
            if (this.initialized) {
                this.log('Already initialized');
                return;
            }
            
            this.log('Initializing CareerManager...');

            this.currentCharacterId = this.getCharacterId();
            this.storageKey = this.getStorageKey();
            
            // Wait for required dependencies
            await this.waitForDependencies();
            
            // Load data with validation
            this.loadCareerData();
            this.validateCareerData();
            
            // Load and validate game state
            this.loadGameState();
            this.validateGameState();
            
            // Setup UI only if on career page
            if (this.isCareerPage()) {
                this.cacheElements();
                this.setupEventListeners();
                this.renderAll();
            }
            
            // Always setup universal listeners
            this.setupUniversalListeners();
            
            this.initialized = true;
            this.log('Initialization complete');
        } catch (error) {
            console.error('CareerManager initialization failed:', error);
            this.fallbackInitialization();
        }
    }

    /**
     * Waits for required dependencies to be available
     */
    static waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                if (window.CAREERS && window.bootstrap) {
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
        });
    }

    /**
     * Sets up universal event listeners for all pages
     */
    static setupUniversalListeners() {
        // Time advancement listener
        const timeAdvancedListener = (e) => {
            if (e.detail?.timeState) {
                this.handleTimeAdvanced(e.detail.timeState);
            }
        };
        
        document.addEventListener('timeAdvancedConsolidated', timeAdvancedListener);
        this.eventListeners.push({
            element: document,
            type: 'timeAdvancedConsolidated',
            listener: timeAdvancedListener
        });
        
        // Storage listener for cross-tab sync
        const storageListener = (e) => {
            if (e.key === this.getStorageKey()) {
                try {
                    const newState = JSON.parse(e.newValue);
                    if (newState && newState.lastUpdated !== this.gameState.lastUpdated) {
                        this.gameState = newState;
                        if (this.isCareerPage()) this.renderAll();
                        this.log('State updated from storage');
                    }
                } catch (error) {
                    console.error('Error parsing career state:', error);
                }
            }
        };
        
        window.addEventListener('storage', storageListener);
        this.eventListeners.push({
            element: window,
            type: 'storage',
            listener: storageListener
        });
    }

    /**
     * Fallback initialization when main init fails
     */
    static fallbackInitialization() {
        this.careersData = [];
        this.gameState = this.getDefaultGameState();
        this.initialized = false;
    }

    static cleanup() {
        this.removeEventListeners();
        this.elements = {};
        this.initialized = false;
        this.log('Cleanup completed');
    }

    static removeEventListeners() {
        this.eventListeners.forEach(({element, type, listener}) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];
    }

    // ===================================================================
    // DATA MANAGEMENT
    // ===================================================================

    /**
     * Loads career data from window.CAREERS with validation
     */
    static loadCareerData() {
        try {
            if (!Array.isArray(window.CAREERS)) {
                throw new Error('window.CAREERS is not an array');
            }
            
            this.careersData = [...window.CAREERS]; // Create copy
            this.log(`Loaded ${this.careersData.length} careers`);
        } catch (e) {
            console.error('Error loading career data:', e);
            this.careersData = [];
        }
    }

    /**
     * Validates loaded career data structure
     */
    static validateCareerData() {
        if (!Array.isArray(this.careersData)) {
            console.error('Invalid career data - initializing empty array');
            this.careersData = [];
            return;
        }
        
        this.careersData = this.careersData.filter(job => {
            const isValid = 
                typeof job.id === 'string' &&
                typeof job.title === 'string' &&
                typeof job.salary === 'number' &&
                typeof job.description === 'string';
            
            if (!isValid) {
                console.warn('Removing invalid career entry:', job);
            }
            return isValid;
        });
    }

    // ===================================================================
    // STATE MANAGEMENT
    // ===================================================================

    /**
     * Loads game state from localStorage
     */
    static loadGameState() {
        try {
            const key = this.getStorageKey();
            const legacyKey = 'careerGameState';
            const savedState = localStorage.getItem(key) || localStorage.getItem(legacyKey);
            this.gameState = savedState ? JSON.parse(savedState) : this.getDefaultGameState();

            // migrate legacy data into character-scoped key
            if (savedState && !localStorage.getItem(key)) {
                localStorage.setItem(key, savedState);
            }
            this.log("Game state loaded");
        } catch (e) {
            console.error('Error loading game state:', e);
            this.gameState = this.getDefaultGameState();
        }
    }

    /**
     * Validates game state structure
     */
    static validateGameState() {
        if (!this.gameState) {
            this.gameState = this.getDefaultGameState();
            return;
        }
        
        const defaults = this.getDefaultGameState();
        for (const key in defaults) {
            if (this.gameState[key] === undefined) {
                this.gameState[key] = defaults[key];
            }
        }
        
        if (this.gameState.currentJob) {
            const requiredProps = ['id', 'title', 'salary', 'performance', 'monthsWorked'];
            const isValid = requiredProps.every(prop => prop in this.gameState.currentJob);
            
            if (!isValid) {
                console.warn('Invalid current job - resetting');
                this.gameState.currentJob = null;
            }
        }
    }

    /**
     * Returns default game state structure
     */
    static getDefaultGameState() {
        return {
            currentJob: null,
            jobHistory: [],
            experience: {},
            skills: {},
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Saves current game state to localStorage
     */
    static saveGameState() {
        try {
            this.gameState.lastUpdated = Date.now();
            localStorage.setItem(this.getStorageKey(), JSON.stringify(this.gameState));
            localStorage.setItem('careerUpdateTrigger', Date.now().toString());
            this.log('Game state saved');
            return true;
        } catch (e) {
            console.error('Error saving game state:', e);
            return false;
        }
    }

    // ===================================================================
    // CORE FUNCTIONALITY
    // ===================================================================

    /**
     * Gets current job or null if unemployed
     */
    static getCurrentJob() {
        return this.gameState?.currentJob || null;
    }

    /**
     * Checks if player meets all requirements for a job
     */
    static canApplyForJob(jobId) {
        try {
            if (typeof jobId !== 'string' || !jobId.trim()) {
                throw new Error('Invalid jobId');
            }
            
            const job = this.careersData.find(j => j.id === jobId);
            if (!job) {
                throw new Error(`Job not found: ${jobId}`);
            }
            
            const playerAge = TimeManager?.timeState?.age || 18;
            const playerEducation = window.EducationManager?.gameState?.education?.completedPrograms || [];
            const playerSkills = window.EducationManager?.gameState?.education?.skills || {};
            
            return this.checkAgeRequirement(job, playerAge) &&
                   this.checkEducationRequirement(job, playerEducation) &&
                   this.checkSkillRequirements(job, playerSkills) &&
                   this.checkExperienceRequirements(job);
        } catch (error) {
            console.error(`Error in canApplyForJob:`, error);
            return false;
        }
    }

    /**
     * Checks age requirement for a job
     */
    static checkAgeRequirement(job, playerAge) {
        if (!job.requirements?.age) return true;
        return playerAge >= job.requirements.age;
    }

    /**
     * Checks education requirement for a job
     */
    static checkEducationRequirement(job, playerEducation) {
        if (!job.requirements?.education) return true;
        if (job.requirements.education.includes('none')) return true;
        return job.requirements.education.some(edu => playerEducation.includes(edu));
    }

    /**
     * Checks skill requirements for a job
     */
    static checkSkillRequirements(job, playerSkills) {
        if (!job.requirements?.skills) return true;
        return job.requirements.skills.every(skill => {
            const skillData = playerSkills[skill];
            return skillData && skillData.level > 0;
        });
    }

    /**
     * Checks experience requirements for a job
     */
    static checkExperienceRequirements(job) {
        if (!job.requirements?.experience) return true;
        return job.requirements.experience.every(exp => 
            this.gameState.experience[exp] > 0
        );
    }

    /**
     * Gets missing requirements for a job
     */
    static getMissingRequirements(jobId) {
        const missing = {
            age: false,
            education: [],
            skills: [],
            experience: []
        };

        try {
            const job = this.careersData.find(j => j.id === jobId);
            if (!job) return missing;
            
            const playerAge = TimeManager?.timeState?.age || 18;
            const playerEducation = window.EducationManager?.gameState?.education?.completedPrograms || [];
            const playerSkills = window.EducationManager?.gameState?.education?.skills || {};
            
            // Check age
            if (job.requirements?.age && playerAge < job.requirements.age) {
                missing.age = job.requirements.age;
            }
            
            // Check education
            if (job.requirements?.education && !job.requirements.education.includes('none')) {
                missing.education = job.requirements.education.filter(edu => 
                    !playerEducation.includes(edu)
                );
            }
            
            // Check skills
            if (job.requirements?.skills) {
                missing.skills = job.requirements.skills.filter(skill => {
                    const skillData = playerSkills[skill];
                    return !skillData || skillData.level === 0;
                });
            }
            
            // Check experience
            if (job.requirements?.experience) {
                missing.experience = job.requirements.experience.filter(exp => 
                    !this.gameState.experience[exp] || this.gameState.experience[exp] === 0
                );
            }
        } catch (error) {
            console.error(`Error in getMissingRequirements:`, error);
        }
        
        return missing;
    }

    /**
     * Applies for a job
     */
    static applyForJob(jobId) {
        if (!this.canApplyForJob(jobId)) {
            return false;
        }
        
        const job = this.careersData.find(j => j.id === jobId);
        if (!job) return false;
        
        // Create new job record
        const newJob = { 
            ...job,
            startDate: this.getCurrentDateString(),
            performance: 50,
            monthsWorked: 0,
            satisfaction: this.DEFAULT_SATISFACTION
        };
        
        // Add current job to history if exists
        if (this.gameState.currentJob) {
            this.addJobToHistory(this.gameState.currentJob);
        }
        
        // Set new job
        this.gameState.currentJob = newJob;
        this.saveGameState();
        
        // Update UI if on career page
        if (this.isCareerPage()) {
            this.renderAll();
            this.hideModal();
        }
        
        EventManager.addToEventLog(`Started new job as ${job.title}`, 'success');
        
        // Dispatch event to notify other systems
        document.dispatchEvent(new CustomEvent('careerUpdated', {
            detail: {
                jobChanged: true,
                newJob: newJob
            }
        }));
        
        return true;
    }

    /**
     * Adds current job to history with end date
     */
    static addJobToHistory(job) {
        this.gameState.jobHistory.push({
            ...job,
            endDate: this.getCurrentDateString()
        });
    }

    /**
     * Quits current job
     */
    static quitJob() {
        if (!this.gameState.currentJob) return;
        
        const jobTitle = this.gameState.currentJob.title;
        this.addJobToHistory(this.gameState.currentJob);
        this.gameState.currentJob = null;
        this.saveGameState();
        
        if (this.isCareerPage()) {
            this.renderAll();
        }
        
        EventManager.addToEventLog(`Quit job as ${jobTitle}`, 'warning');
        
        document.dispatchEvent(new CustomEvent('careerUpdated', {
            detail: {
                jobChanged: true,
                newJob: null
            }
        }));
    }

    /**
     * Handles time advancement events
     */
    static handleTimeAdvanced(timeState) {
        if (!this.initialized || !this.gameState.currentJob) return;

        const monthsAdvanced = timeState?.monthsAdvanced || 3;
        
        // Update job duration
        this.gameState.currentJob.monthsWorked += monthsAdvanced;
        
        // Process salary once through FinancesManager if available; otherwise fall back
        if (typeof FinancesManager !== 'undefined' && typeof FinancesManager.processSalary === 'function') {
            FinancesManager.processSalary(monthsAdvanced);
        } else {
            const salaryPayment = this.gameState.currentJob.salary * monthsAdvanced;
            this.processSalaryPayment(salaryPayment);
        }
        
        // Update performance and skills
        this.updatePerformance(monthsAdvanced);
        this.gainExperience(monthsAdvanced);
        this.gainSkills(monthsAdvanced);
        
        // Handle quarterly events
        if (timeState?.isQuarterly) {
            this.handleQuarterTransition();
        }
        
        // Check for promotion
        this.checkForPromotion();
        
        // Save state
        this.saveGameState();
        
        // Update UI if on career page
        if (this.isCareerPage()) {
            this.renderCurrentJob();
            this.updateStats();
        }
        
        document.dispatchEvent(new CustomEvent('careerUpdated', {
            detail: {
                jobChanged: false,
                performanceChanged: true,
                monthsAdvanced: monthsAdvanced
            }
        }));
    }

    static handleQuarterTransition() {
        if (!this.gameState.currentJob) return;
        
        // Add quarterly performance review
        const performanceChange = Math.floor(Math.random() * 10) - 3; // -3 to +6
        this.gameState.currentJob.performance = Math.max(0, 
            Math.min(100, this.gameState.currentJob.performance + performanceChange));
        
        // Add quarterly satisfaction adjustment
        const satisfactionChange = Math.floor(Math.random() * 8) - 2; // -2 to +5
        this.gameState.currentJob.satisfaction = Math.max(0, 
            Math.min(100, (this.gameState.currentJob.satisfaction || this.DEFAULT_SATISFACTION) + satisfactionChange));
        
        this.saveGameState();
        
        if (typeof EventManager !== 'undefined') {
            EventManager.addToEventLog(
                `Quarterly review: Performance ${performanceChange > 0 ? '+' : ''}${performanceChange}%`, 
                'info'
            );
        }
    }

    /**
     * Universal salary payment processor
     */
    static processSalaryPayment(amount) {
        if (typeof amount !== 'number' || amount <= 0) return;
        
        try {
            // Try FinancesManager first
            if (typeof FinancesManager !== 'undefined' && FinancesManager.addMoney) {
                FinancesManager.addMoney(amount, 'Salary payment', 'salary');
                this.log('Processed salary via FinancesManager');
                return;
            }
            
            // Fallback to direct character storage
            const currentCharId = localStorage.getItem('currentCharacterId');
            if (currentCharId) {
                const characterKey = `lifeSimCharacter_${currentCharId}`;
                const character = JSON.parse(localStorage.getItem(characterKey)) || {};
                
                if (!character._finances) {
                    character._finances = { 
                        cash: 0, 
                        bank: 0,
                        monthlyIncome: 0,
                        monthlyExpenses: 0
                    };
                }
                
                character._finances.cash = (character._finances.cash || 0) + amount;
                localStorage.setItem(characterKey, JSON.stringify(character));
                this.log('Processed salary via direct storage');
                return;
            }
            
            // Ultimate fallback to simple storage
            const finances = JSON.parse(localStorage.getItem('characterFinances')) || { cash: 0, bank: 0 };
            finances.cash += amount;
            localStorage.setItem('characterFinances', JSON.stringify(finances));
            this.log('Processed salary via fallback storage');
            
            if (typeof EventManager !== 'undefined') {
                EventManager.addToEventLog(`Received salary: $${amount.toLocaleString()}`, 'success');
            }
        } catch (error) {
            console.error('Salary payment processing failed:', error);
            if (typeof EventManager !== 'undefined') {
                EventManager.addToEventLog('Failed to process salary payment', 'error');
            }
        }
    }

    /**
     * Updates job performance
     */
    static updatePerformance(monthsAdvanced) {
        const increase = (Math.random() * 2) + 0.5; // 0.5 to 2.5 per month
        this.gameState.currentJob.performance = Math.min(
            this.PERFORMANCE_RANGE.max,
            this.gameState.currentJob.performance + (increase * monthsAdvanced)
        );
    }

    /**
     * Gains experience from current job
     */
    static gainExperience(monthsAdvanced) {
        if (!this.gameState.currentJob.experienceGained) return;
        
        this.gameState.currentJob.experienceGained.forEach(exp => {
            this.gameState.experience[exp] = (this.gameState.experience[exp] || 0) + monthsAdvanced;
        });
    }

    /**
     * Gains skills from current job
     */
    static gainSkills(monthsAdvanced) {
        if (!window.EducationManager?.gameState || !this.gameState.currentJob.skillsGained) return;
        
        this.gameState.currentJob.skillsGained.forEach(skill => {
            if (window.EducationManager.gameState.education.skills[skill]) {
                window.EducationManager.gameState.education.skills[skill].xp += 100 * monthsAdvanced;
                window.EducationManager.gameState.education.skills[skill].level = 
                    Math.floor(window.EducationManager.gameState.education.skills[skill].xp / 1000) + 1;
            }
        });
    }

    /**
     * Checks if player qualifies for promotion
     */
    static checkForPromotion() {
        if (!this.gameState.currentJob?.nextPositions || 
            this.gameState.currentJob.performance < this.PROMOTION_THRESHOLD ||
            this.gameState.currentJob.monthsWorked < 24) return;
            
        const possiblePromotions = this.gameState.currentJob.nextPositions
            .filter(pos => this.canApplyForJob(pos));
        
        if (possiblePromotions.length > 0) {
            this.applyForJob(possiblePromotions[0]);
            EventManager.addToEventLog(`Promoted to ${this.gameState.currentJob.title}!`, 'success');
        }
    }

    /**
     * Calculates job satisfaction (0-100)
     */
    static calculateJobSatisfaction() {
        if (!this.gameState.currentJob) return 0;
        
        const job = this.gameState.currentJob;
        let satisfaction = job.satisfaction || this.DEFAULT_SATISFACTION;
        
        // Adjust based on performance
        satisfaction += (job.performance - 50) * 0.3;
        
        // Adjust based on duration
        satisfaction -= Math.min(30, job.monthsWorked * 0.2);
        
        return Math.max(this.MIN_SATISFACTION, Math.min(this.MAX_SATISFACTION, satisfaction));
    }

    // ===================================================================
    // UI MANAGEMENT (Only used on career page)
    // ===================================================================

    /**
     * Checks if current page is career page
     */
    static isCareerPage() {
        return !!document.querySelector('.job-listings-container');
    }

    /**
     * Caches DOM elements (only on career page)
     */
    static cacheElements() {
        const getElement = (id) => {
            const el = document.getElementById(id);
            if (!el) console.error(`Element not found: ${id}`);
            return el;
        };
        
        this.elements = {
            jobsContainer: document.querySelector('.job-listings-container'),
            currentJob: getElement('currentJob'),
            salaryDisplay: getElement('salaryDisplay'),
            performanceDisplay: getElement('performanceDisplay'),
            satisfactionDisplay: getElement('satisfactionDisplay'),
            currentJobDetails: getElement('currentJobDetails'),
            jobHistory: getElement('jobHistory'),
            applyJobBtn: getElement('applyJobBtn'),
            jobDetailsModal: getElement('jobDetailsModal'),
            jobDetailsTitle: getElement('jobDetailsTitle'),
            jobDetailsDescription: getElement('jobDetailsDescription'),
            jobDetailsSalary: getElement('jobDetailsSalary'),
            jobDetailsRequirements: getElement('jobDetailsRequirements'),
            jobDetailsSkills: getElement('jobDetailsSkills')
        };
        
        // Initialize modal if exists
        if (this.elements.jobDetailsModal) {
            this.elements.modal = new bootstrap.Modal(this.elements.jobDetailsModal);
        } else {
            console.error('Modal element not found');
        }
        
        // Add quit job button if exists
        const quitJobBtn = document.getElementById('quitJobBtn');
        if (quitJobBtn) {
            quitJobBtn.addEventListener('click', () => this.quitJob());
        }
    }

    /**
     * Sets up event listeners (only on career page)
     */
    static setupEventListeners() {
        this.removeEventListeners();
        
        // Job click listener
        if (this.elements.jobsContainer) {
            const jobClickListener = (e) => {
                const button = e.target.closest('.job-action-btn');
                if (button) {
                    e.preventDefault();
                    this.showJobDetails(button.dataset.jobId);
                }
            };
            
            this.elements.jobsContainer.addEventListener('click', jobClickListener);
            this.eventListeners.push({
                element: this.elements.jobsContainer,
                type: 'click',
                listener: jobClickListener
            });
        }
        
        // Apply job button
        if (this.elements.applyJobBtn) {
            const applyClickListener = () => {
                if (this.selectedJob) {
                    this.applyForJob(this.selectedJob.id);
                }
            };
            
            this.elements.applyJobBtn.addEventListener('click', applyClickListener);
            this.eventListeners.push({
                element: this.elements.applyJobBtn,
                type: 'click',
                listener: applyClickListener
            });
        }
    }

    /**
     * Hides the job details modal
     */
    static hideModal() {
        if (this.elements.modal) {
            this.elements.modal.hide();
        }
    }

    // ===================================================================
    // RENDERING (Only used on career page)
    // ===================================================================

    /**
     * Renders all UI components
     */
    static renderAll() {
        if (!this.isCareerPage()) return;
        
        this.renderJobListings();
        this.renderCurrentJob();
        this.renderJobHistory();
        this.updateStats();
    }

    /**
     * Renders job listings
     */
    static renderJobListings() {
        if (!this.elements.jobsContainer) return;
        
        this.elements.jobsContainer.innerHTML = this.careersData.map(job => {
            const canApply = this.canApplyForJob(job.id);
            const isCurrentJob = this.gameState.currentJob?.id === job.id;
            
            let buttonText = 'View Details';
            let statusBadge = '';
            
            if (isCurrentJob) {
                statusBadge = '<span class="badge bg-primary">Current Job</span>';
            } else if (!canApply) {
                statusBadge = '<span class="badge bg-secondary">Requirements Not Met</span>';
            }
            
            return `
                <div class="col-md-6">
                    <div class="job-card">
                        ${statusBadge}
                        <div class="job-card-header">
                            <h3>${job.title}</h3>
                            <span class="badge bg-success">$${job.salary.toLocaleString()}/month</span>
                        </div>
                        <p>${job.description}</p>
                        <div class="d-flex flex-wrap gap-1 mb-2">
                            ${(job.skillsGained || []).map(skill => 
                                `<span class="badge bg-info">${window.SKILLS?.[skill]?.name || skill}</span>`
                            ).join('')}
                        </div>
                        <button class="btn btn-primary job-action-btn w-100" 
                                data-job-id="${job.id}">
                            ${buttonText}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Renders current job details
     */
    static renderCurrentJob() {
        if (!this.elements.currentJobDetails) return;
        
        if (!this.gameState.currentJob) {
            this.elements.currentJobDetails.innerHTML = `
                <div class="alert alert-info mb-0">
                    You are not currently employed.
                </div>
            `;
            return;
        }
        
        const job = this.gameState.currentJob;
        const satisfaction = this.calculateJobSatisfaction();
        
        this.elements.currentJobDetails.innerHTML = `
            <div class="current-job-item">
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <div class="d-flex justify-content-between mb-2">
                    <span><strong>Salary:</strong> $${job.salary.toLocaleString()}/month</span>
                    <span><strong>Performance:</strong> ${job.performance}%</span>
                </div>
                <div class="progress mb-2" style="height: 10px;">
                    <div class="progress-bar" role="progressbar" 
                         style="width: ${job.performance}%" 
                         aria-valuenow="${job.performance}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span><strong>Satisfaction:</strong> ${Math.round(satisfaction)}%</span>
                    <span><strong>Duration:</strong> ${job.monthsWorked} months</span>
                </div>
                <div class="d-flex flex-wrap gap-1 mb-3">
                    ${(job.skillsGained || []).map(skill => 
                        `<span class="badge bg-info">${window.SKILLS?.[skill]?.name || skill}</span>`
                    ).join('')}
                </div>
                <button class="btn btn-danger w-100" id="quitJobBtn">
                    Quit Job
                </button>
            </div>
        `;
        
        // Add quit job button listener
        const quitBtn = document.getElementById('quitJobBtn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quitJob());
        }
    }

    /**
     * Renders job history
     */
    static renderJobHistory() {
        if (!this.elements.jobHistory) return;
        
        if (this.gameState.jobHistory.length === 0) {
            this.elements.jobHistory.innerHTML = `
                <div class="alert alert-info mb-0">
                    No employment history yet.
                </div>
            `;
            return;
        }
        
        this.elements.jobHistory.innerHTML = this.gameState.jobHistory.map(job => `
            <div class="job-history-item">
                <div class="d-flex justify-content-between">
                    <strong>${job.title}</strong>
                    <span>$${job.salary.toLocaleString()}/month</span>
                </div>
                <div class="d-flex justify-content-between text-muted small">
                    <span>${job.startDate} - ${job.endDate}</span>
                    <span>${job.monthsWorked} months</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Updates stats displays
     */
    static updateStats() {
        if (!this.isCareerPage()) return;
        
        if (this.elements.currentJob) {
            this.elements.currentJob.textContent = this.gameState.currentJob?.title || 'Unemployed';
        }
        
        if (this.elements.salaryDisplay) {
            this.elements.salaryDisplay.textContent = this.gameState.currentJob ? 
                `$${this.gameState.currentJob.salary.toLocaleString()}/month` : '$0/month';
        }
        
        if (this.elements.performanceDisplay) {
            this.elements.performanceDisplay.textContent = this.gameState.currentJob ? 
                `${this.gameState.currentJob.performance}%` : '0%';
        }
        
        if (this.elements.satisfactionDisplay) {
            const satisfaction = this.calculateJobSatisfaction();
            this.elements.satisfactionDisplay.textContent = this.gameState.currentJob ? 
                `${Math.round(satisfaction)}%` : '0%';
        }
    }

    /**
     * Shows job details in modal
     */
    static showJobDetails(jobId) {
        const job = this.careersData.find(j => j.id === jobId);
        if (!job) {
            this.log(`Job details not found for ID: ${jobId}`);
            return;
    }

    this.selectedJob = job; // Set the selected job for apply button

    // Update modal content
    this.elements.jobDetailsTitle.textContent = job.title;
    this.elements.jobDetailsDescription.textContent = job.description;
    this.elements.jobDetailsSalary.textContent = `$${job.salary.toLocaleString()}/month`;

    // Update requirements
    this.elements.jobDetailsRequirements.innerHTML = '';
    const missingRequirements = this.getMissingRequirements(jobId);
    if (job.requirements && Object.keys(job.requirements).length > 0) {
        if (job.requirements.age) {
            const li = document.createElement('li');
            li.innerHTML = `Age: ${job.requirements.age}+ ${missingRequirements.age ? '<span class="text-danger">(Missing)</span>' : ''}`;
            this.elements.jobDetailsRequirements.appendChild(li);
        }
        if (job.requirements.education && job.requirements.education.length > 0 && !job.requirements.education.includes('none')) {
            const li = document.createElement('li');
            li.innerHTML = `Education: ${job.requirements.education.join(', ')} ${missingRequirements.education.length > 0 ? '<span class="text-danger">(Missing: ' + missingRequirements.education.join(', ') + ')</span>' : ''}`;
            this.elements.jobDetailsRequirements.appendChild(li);
        }
        if (job.requirements.skills && job.requirements.skills.length > 0) {
            const li = document.createElement('li');
            li.innerHTML = `Skills: ${job.requirements.skills.join(', ')} ${missingRequirements.skills.length > 0 ? '<span class="text-danger">(Missing: ' + missingRequirements.skills.join(', ') + ')</span>' : ''}`;
            this.elements.jobDetailsRequirements.appendChild(li);
        }
        if (job.requirements.experience && job.requirements.experience.length > 0) {
            const li = document.createElement('li');
            li.innerHTML = `Experience: ${job.requirements.experience.join(', ')} ${missingRequirements.experience.length > 0 ? '<span class="text-danger">(Missing: ' + missingRequirements.experience.join(', ') + ')</span>' : ''}`;
            this.elements.jobDetailsRequirements.appendChild(li);
        }
        if (this.elements.jobDetailsRequirements.children.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'None';
            this.elements.jobDetailsRequirements.appendChild(li);
        }
    } else {
        const li = document.createElement('li');
        li.textContent = 'None';
        this.elements.jobDetailsRequirements.appendChild(li);
    }

    // Update skills gained
    this.elements.jobDetailsSkills.innerHTML = '';
    if (job.skillsGained && job.skillsGained.length > 0) {
        job.skillsGained.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill;
            this.elements.jobDetailsSkills.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'None';
        this.elements.jobDetailsSkills.appendChild(li);
    }

    // Enable/disable apply button based on requirements
    const canApply = this.canApplyForJob(jobId);
    this.elements.applyJobBtn.disabled = !canApply;
    
    // Instantiate and show the Bootstrap modal
    // Show modal using cached instance when available
    if (this.elements.modal) {
        this.elements.modal.show();
    } else if (this.elements.jobDetailsModal) {
        const jobDetailsModalInstance = new bootstrap.Modal(this.elements.jobDetailsModal);
        jobDetailsModalInstance.show();
    }

    this.log(`Showing details for job: ${job.title}`);
}

    // ===================================================================
    // UTILITIES
    // ===================================================================

    /**
     * Gets current date string
     */
    static getCurrentDateString() {
        if (window.timeState?.currentDate) {
            return formatDate(window.timeState.currentDate);
        }
        if (typeof TimeManager !== 'undefined' && TimeManager.getCurrentDateString) {
            return TimeManager.getCurrentDateString();
        }
        
        // Fallback implementation
        const now = new Date();
        return now.toLocaleDateString();
    }

    /**
     * Logs messages if debug is enabled
     */
    static log(...args) {
        if (this.debug) {
            console.log('[CareerManager]', ...args);
        }
    }

    static getCharacterId() {
        return localStorage.getItem('currentCharacterId') || localStorage.getItem('lastCharacterId') || 'default';
    }

    static getStorageKey() {
        const charId = this.currentCharacterId || this.getCharacterId();
        return `careerGameState_${charId}`;
    }
}

// Initialize when DOM is loaded (works on all pages)
document.addEventListener('DOMContentLoaded', () => {
    CareerManager.init();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    CareerManager.cleanup();
});

// Make CareerManager globally available
window.CareerManager = CareerManager;
