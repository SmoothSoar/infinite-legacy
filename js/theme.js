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
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = themeName === 'light' ? 'bi bi-moon' : 'bi bi-sun';
        }
        
        // Update text if present
        const textSpan = themeToggle.querySelector('.d-none.d-sm-inline');
        if (textSpan) {
            textSpan.textContent = themeName === 'light' ? 'Dark Mode' : 'Light Mode';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});