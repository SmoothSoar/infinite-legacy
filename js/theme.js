class ThemeManager {
    static init() {
        // Set initial theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        // Add event listener to theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    static setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
        this.updateThemeButton(themeName);
        
        // Force repaint of main content area
        const main = document.querySelector('main');
        if (main) {
            main.style.display = 'none';
            main.offsetHeight; // Trigger reflow
            main.style.display = '';
        }
    }

    static toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    static updateThemeButton(themeName) {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        // Update icon
        const icon = themeToggle.querySelector('.theme-icon');
        if (icon) {
            icon.className = `theme-icon bi ${themeName === 'light' ? 'bi-moon' : 'bi-sun'}`;
        }
        
        // Update text if present
        const textSpan = themeToggle.querySelector('.d-none.d-sm-inline');
        if (textSpan && textSpan.textContent.trim() === 'Theme') {
            textSpan.textContent = themeName === 'light' ? 'Dark Mode' : 'Light Mode';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// Make available globally
window.ThemeManager = ThemeManager;