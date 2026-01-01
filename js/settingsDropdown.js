/**
 * settingsDropdown.js - Fully Functional Settings Management
 */


class SettingsDropdown {
    static VERSION = 3;
    static initialized = false;
    
    static init() {
        if (this.initialized) return;
        
        this.cacheElements();
        this.setupEventListeners();
        this.initializeTheme(); // Initialize theme on load
        this.initialized = true;
        console.log('SettingsDropdown initialized');
    }

    static cacheElements() {
        this.elements = {
            dropdown: document.getElementById('settingsDropdown'),
            switchCharacterBtn: document.getElementById('switchCharacterBtn'),
            deleteCharacterBtn: document.getElementById('deleteCharacterBtn'),
            resetCharacterBtn: document.getElementById('resetCharacterBtn'),
            themeToggleDropdown: document.getElementById('themeToggleDropdown'), // Required for theme toggle
            toggleSoundBtn: document.getElementById('toggleSoundBtn'),
            exportSaveBtn: document.getElementById('exportSaveBtn'),
            importSaveBtn: document.getElementById('importSaveBtn'),
            importFileInput: null
        };
    }

    static setupEventListeners() {
        // Theme toggle - fixed implementation
        this.elements.themeToggleDropdown?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTheme();
        });

        // Proxy buttons that should trigger the same theme toggle
        document.querySelectorAll('[data-theme-toggle-proxy]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.elements.themeToggleDropdown?.click();
            });
        });

        // Sound toggle
        this.elements.toggleSoundBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleSound();
        });

        // Character management
        this.elements.switchCharacterBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showCharacterSwitchModal();
        });

        this.elements.deleteCharacterBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.confirmCharacterDeletion();
        });

        this.elements.resetCharacterBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.confirmCharacterReset();
        });

        // Data management
        this.elements.exportSaveBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showExportOptions();
        });

        this.elements.importSaveBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showImportOptions();
        });
    }


    /* ========================
       CHARACTER MANAGEMENT
       ======================== */
    
    static showCharacterSwitchModal() {
        const characters = this.getAllCharacters();
        
        if (characters.length <= 1) {
            return this.showToast('No other characters available', 'warning');
        }

        const modalHTML = `
            <div class="modal fade" id="switchCharacterModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Switch Character</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="list-group">
                                ${characters.map(char => `
                                    <button type="button" class="list-group-item list-group-item-action ${char.id === this.getCurrentCharacterId() ? 'active' : ''}"
                                        data-character-id="${char.id}">
                                        ${char.name} (Age ${char.age})
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('switchCharacterModal'));
        modal.show();

        document.querySelectorAll('[data-character-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const characterId = btn.dataset.characterId;
                this.switchCharacter(characterId);
                modal.hide();
            });
        });

        modal._element.addEventListener('hidden.bs.modal', () => {
            modal._element.remove();
        });
    }

    static switchCharacter(characterId) {
        localStorage.setItem('currentCharacterId', characterId);
        this.showToast('Character switched successfully');
        setTimeout(() => window.location.reload(), 500);
    }

    static confirmCharacterDeletion() {
        const currentCharId = this.getCurrentCharacterId();
        if (!currentCharId) return this.showToast('No character selected', 'danger');

        const characters = this.getAllCharacters();
        const currentChar = characters.find(c => c.id === currentCharId);
        if (!currentChar) return this.showToast('Character not found', 'danger');

        if (characters.length <= 1) {
            return this.showToast('Cannot delete last character', 'danger');
        }

        this.showConfirmation(
            'Delete Character',
            `Are you sure you want to permanently delete ${currentChar.name}?`,
            () => {
                if (this.deleteCharacter(currentCharId)) {
                    const remainingChars = this.getAllCharacters();
                    
                    // Switch to another character if we deleted the current one
                    if (remainingChars.length > 0) {
                        const newCurrentId = remainingChars[0].id;
                        localStorage.setItem('currentCharacterId', newCurrentId);
                        this.showToast(`Deleted ${currentChar.name}. Switched to ${remainingChars[0].name}`);
                    }
                    
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    this.showToast('Failed to delete character', 'danger');
                }
            }
        );
    }

    static deleteCharacter(characterId) {
        try {
            if (characterId === 'default') return false;

            // Remove from character list
            const characters = this.getAllCharacters().filter(c => c.id !== characterId);
            localStorage.setItem('lifeSimCharacters', JSON.stringify(characters));

            // Remove character data
            localStorage.removeItem(`lifeSimCharacter_${characterId}`);

            return true;
        } catch (e) {
            console.error("Error deleting character:", e);
            return false;
        }
    }

    static confirmCharacterReset() {
        const currentCharId = this.getCurrentCharacterId();
        if (!currentCharId) return this.showToast('No character selected', 'danger');

        const characters = this.getAllCharacters();
        const currentChar = characters.find(c => c.id === currentCharId);
        if (!currentChar) return this.showToast('Character not found', 'danger');

        this.showConfirmation(
            'Reset Character',
            `This will COMPLETELY reset ${currentChar.name}. All progress will be lost! Continue?`,
            () => {
                if (this.resetCharacter(currentCharId)) {
                    this.showToast('Character reset successfully');
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    this.showToast('Failed to reset character', 'danger');
                }
            }
        );
    }

static resetCharacter(characterId) {
    try {
        // 1. Get existing character data to preserve identity
        const oldCharData = JSON.parse(localStorage.getItem(`lifeSimCharacter_${characterId}`)) || {};
        
        // 2. Create completely fresh character data with preserved identity
        const newChar = {
            // Preserve only identity information
            id: characterId,
            _name: oldCharData._name || 'Player',
            _age: 14,  // Changed default age to 14
            _gender: oldCharData._gender || 'Unknown',
            _country: oldCharData._country || { code: 'US', name: 'United States' },
            _culture: oldCharData._culture || { code: 'US', name: 'American' },
            _appearance: oldCharData._appearance || {},
            
            // Reset ALL progress to starting values
            _stats: {
                health: 100,
                happiness: 75,
                education: 50,
                wealth: 25,
                fitness: 50,
                intelligence: 50,
                charisma: 50
            },
            _skills: {
                programming: 0,
                communication: 0,
                leadership: 0,
                cooking: 0,
                driving: 0,
                creativity: 0
            },
            _finances: {
                cash: 1000,
                bank: 0,
                debt: 0,
                creditScore: 650,
                monthlyIncome: 0,
                monthlyExpenses: 0
            },
            _education: [],
            _jobs: [],
            _relationships: [],
            _inventory: [],
            _properties: [],
            _vehicles: [],
            _achievements: [],
            _events: [],
            _version: '1.1',
            _createdAt: new Date().toISOString(),
            _lastPlayed: new Date().toISOString()
        };

        // 3. Reset career data
        localStorage.setItem('careerGameState', JSON.stringify({
            currentJob: null,
            jobHistory: [],
            experience: {},
            skills: {},
            lastUpdated: new Date().toISOString()
        }));

        // 4. Reset education data
        localStorage.setItem('educationGameState', JSON.stringify({
            balance: 10000,
            currentYear: 1,
            totalMonths: 0,
            education: {
                level: 'High School',
                gpa: 3.2,
                enrolledPrograms: [],
                completedPrograms: [],
                skills: {}
            }
        }));

        // 5. Reset time state
        localStorage.setItem('timeState', JSON.stringify({
            currentDate: 'Year 1, Q1',
            age: 14,
            monthsPassed: 0
        }));

        // 6. Save the completely reset character
        localStorage.setItem(`lifeSimCharacter_${characterId}`, JSON.stringify(newChar));
        
        // 7. Update the character list entry
        const characters = this.getAllCharacters();
        const charIndex = characters.findIndex(c => c.id === characterId);
        if (charIndex !== -1) {
            characters[charIndex] = {
                id: characterId,
                name: newChar._name,
                age: newChar._age, // Now will be 14
                gender: newChar._gender,
                country: newChar._country,
                lastPlayed: new Date().toISOString()
            };
            localStorage.setItem('lifeSimCharacters', JSON.stringify(characters));
        }
        
        return true;
    } catch (e) {
        console.error("Error resetting character:", e);
        return false;
    }
}

    /* ========================
       UTILITY FUNCTIONS
       ======================== */

    static getAllCharacters() {
        try {
            return JSON.parse(localStorage.getItem('lifeSimCharacters')) || [];
        } catch (e) {
            console.error("Error loading characters:", e);
            return [];
        }
    }

    static getCurrentCharacterId() {
        return localStorage.getItem('currentCharacterId');
    }

    static showConfirmation(title, message, confirmCallback) {
        const modalHTML = `
            <div class="modal fade" id="confirmationModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${message}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmAction">Confirm</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        modal.show();

        document.getElementById('confirmAction').addEventListener('click', () => {
            confirmCallback();
            modal.hide();
        });

        modal._element.addEventListener('hidden.bs.modal', () => {
            modal._element.remove();
        });
    }

    static showToast(message, type = 'success') {
        const toastHTML = `
            <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        const toastContainer = document.getElementById('toastContainer') || (() => {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '11';
            document.body.appendChild(container);
            return container;
        })();

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        const toastEl = toastContainer.lastElementChild;
        const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 });
        toast.show();

        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }

    /* ========================
       THEME MANAGEMENT (FIXED)
       ======================== */

    static applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (document.body) {
            document.body.setAttribute('data-theme', theme);
            document.body.classList.toggle('theme-dark', theme === 'dark');
            document.body.classList.toggle('theme-light', theme === 'light');
        }
    }
    
    static initializeTheme() {
        try {
            // Get saved theme or system preference
            let theme = localStorage.getItem('theme');
            if (!theme) {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                localStorage.setItem('theme', theme);
            }
            
            // Apply the theme
            this.applyTheme(theme);
            
            // Update toggle button icon
            this.updateThemeButton(theme);
        } catch (e) {
            console.error("Error initializing theme:", e);
        }
    }

    static toggleTheme() {
        try {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Apply the new theme
            this.applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update UI
            this.updateThemeButton(newTheme);
            
            // Notify other components
            document.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: newTheme }
            }));
            
            this.showToast(`Changed to ${newTheme} mode`);
        } catch (e) {
            console.error("Error toggling theme:", e);
            this.showToast('Failed to change theme', 'danger');
        }
    }

    static updateThemeButton(themeName) {
        const themeToggle = this.elements.themeToggleDropdown;
        if (!themeToggle) return;
        
        // Update icon
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = themeName === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
        }
        
        // Update text if present
        const textSpan = themeToggle.querySelector('span');
        if (textSpan) {
            textSpan.textContent = themeName === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
        
        // Update ARIA label
        themeToggle.setAttribute('aria-label', 
            `Switch to ${themeName === 'dark' ? 'light' : 'dark'} mode`);
    }


    /* ========================
       DATA IMPORT/EXPORT
       ======================== */
    
    static showExportOptions() {
        const modalHTML = `
            <div class="modal fade" id="exportModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Export Options</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Export Type</label>
                                <select class="form-select" id="exportType">
                                    <option value="current">Current Character</option>
                                    <option value="all">All Characters</option>
                                    <option value="full">Full Backup</option>
                                </select>
                            </div>
                            <button id="confirmExport" class="btn btn-primary w-100">Export</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('exportModal'));
        modal.show();

        document.getElementById('confirmExport').addEventListener('click', () => {
            const exportType = document.getElementById('exportType').value;
            this.exportData(exportType);
            modal.hide();
        });

        modal._element.addEventListener('hidden.bs.modal', () => {
            modal._element.remove();
        });
    }

    static exportData(type) {
        try {
            let data, filename;
            
            switch (type) {
                case 'current':
                    const currentCharId = this.getCurrentCharacterId();
                    const charData = JSON.parse(localStorage.getItem(`lifeSimCharacter_${currentCharId}`));
                    data = {
                        version: this.VERSION,
                        type: 'character',
                        character: charData,
                        timestamp: new Date().toISOString()
                    };
                    filename = `character_${charData?._name || 'unknown'}.json`;
                    break;
                    
                case 'all':
                    data = {
                        version: this.VERSION,
                        type: 'all_characters',
                        characters: this.getAllCharacters(),
                        currentCharacterId: this.getCurrentCharacterId(),
                        timestamp: new Date().toISOString()
                    };
                    filename = 'all_characters.json';
                    break;
                    
                case 'full':
                    data = {
                        version: this.VERSION,
                        type: 'full_backup',
                        timestamp: new Date().toISOString(),
                        data: {}
                    };
                    
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        data.data[key] = localStorage.getItem(key);
                    }
                    filename = 'full_backup.json';
                    break;
            }

            this.downloadJSON(data, filename);
            this.showToast('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed', 'danger');
        }
    }

    static downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static showImportOptions() {
        const modalHTML = `
            <div class="modal fade" id="importModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Import Options</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Import Type</label>
                                <select class="form-select" id="importType">
                                    <option value="current">Character Data</option>
                                    <option value="full">Full Backup</option>
                                </select>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="overwriteData">
                                <label class="form-check-label" for="overwriteData">
                                    Overwrite existing data
                                </label>
                            </div>
                            <button id="selectImportFile" class="btn btn-primary w-100">Select File</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('importModal'));
        modal.show();

        document.getElementById('selectImportFile').addEventListener('click', () => {
            const importType = document.getElementById('importType').value;
            const overwrite = document.getElementById('overwriteData').checked;
            
            this.setupFileImport(importType, overwrite);
            modal.hide();
        });

        modal._element.addEventListener('hidden.bs.modal', () => {
            modal._element.remove();
        });
    }

    static setupFileImport(importType, overwrite) {
        if (!this.elements.importFileInput) {
            this.elements.importFileInput = document.createElement('input');
            this.elements.importFileInput.type = 'file';
            this.elements.importFileInput.accept = '.json';
            this.elements.importFileInput.style.display = 'none';
            document.body.appendChild(this.elements.importFileInput);

            this.elements.importFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        this.importData(data, importType, overwrite);
                    } catch (error) {
                        console.error('Import failed:', error);
                        this.showToast('Invalid file format', 'danger');
                    }
                };
                reader.readAsText(file);
            });
        }

        this.elements.importFileInput.click();
    }

    static importData(data, type, overwrite) {
        try {
            // Basic validation
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }

            switch (type) {
                case 'current':
                    if (data.type !== 'character') {
                        throw new Error('Not a valid character export file');
                    }
                    
                    this.showConfirmation(
                        'Import Character',
                        `Import character "${data.character?._name || 'unknown'}"? This will ${overwrite ? 'overwrite' : 'merge with'} existing data.`,
                        () => {
                            const charId = data.character?.id || 'imported_' + Date.now();
                            if (overwrite) {
                                localStorage.setItem(`lifeSimCharacter_${charId}`, JSON.stringify(data.character));
                            } else {
                                const existing = JSON.parse(localStorage.getItem(`lifeSimCharacter_${charId}`)) || {};
                                localStorage.setItem(`lifeSimCharacter_${charId}`, JSON.stringify({...existing, ...data.character}));
                            }
                            
                            // Update character list
                            const characters = this.getAllCharacters();
                            if (!characters.some(c => c.id === charId)) {
                                const newChar = {
                                    id: charId,
                                    name: data.character?._name || 'Imported Character',
                                    age: data.character?._age || 18,
                                    gender: data.character?._gender || 'Unknown',
                                    country: data.character?._country || { code: 'US', name: 'United States' },
                                    createdAt: new Date().toISOString(),
                                    lastPlayed: new Date().toISOString()
                                };
                                localStorage.setItem('lifeSimCharacters', JSON.stringify([...characters, newChar]));
                            }
                            
                            this.showToast('Character data imported successfully');
                            setTimeout(() => window.location.reload(), 1000);
                        }
                    );
                    break;
                    
                case 'full':
                    if (data.type !== 'full_backup') {
                        throw new Error('Not a valid backup file');
                    }
                    
                    this.showConfirmation(
                        'Import Full Backup',
                        'This will replace ALL your game data. Are you sure?',
                        () => {
                            localStorage.clear();
                            for (const key in data.data) {
                                localStorage.setItem(key, data.data[key]);
                            }
                            this.showToast('Full backup restored');
                            setTimeout(() => window.location.reload(), 1000);
                        }
                    );
                    break;
            }
        } catch (error) {
            console.error('Import failed:', error);
            this.showToast('Import failed: ' + error.message, 'danger');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    SettingsDropdown.init();
});

// Cleanup
window.addEventListener('beforeunload', () => {
    if (SettingsDropdown.elements?.importFileInput) {
        document.body.removeChild(SettingsDropdown.elements.importFileInput);
    }
});
