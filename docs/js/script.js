
    document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const dropdown = document.getElementById('themeDropdown');
    const buttons = dropdown.querySelectorAll('button');

const themeIcons = {
    light: 'sunny-outline',
    dark: 'moon-outline',
    system: 'contrast-outline'
};
function updateToggleIcon(theme) {
    const iconName = themeIcons[theme] || 'contrast-outline';

    while (themeToggle.firstChild) {
        themeToggle.removeChild(themeToggle.firstChild);
    }

    const icon = document.createElement('ion-icon');
    icon.setAttribute('name', iconName);
    themeToggle.appendChild(icon);
}
    themeToggle.addEventListener('click', () => {
        dropdown.classList.toggle('show');
    });

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;

            document.body.classList.remove('dark_theme', 'light_theme');

            if (theme === 'dark') {
                document.body.classList.add('dark_theme');
            } else if (theme === 'light') {
                document.body.classList.add('light_theme');
            } else if (theme === 'system') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (isDark) {
                    document.body.classList.add('dark_theme');
                } else {
                    document.body.classList.add('light_theme');
                }
            }

            localStorage.setItem('theme', theme);
            updateToggleIcon(theme);
            dropdown.classList.remove('show');
        });
    });

    const savedTheme = localStorage.getItem('theme') || 'dark_theme';
    const event = new Event('click');
    const savedButton = dropdown.querySelector(`[data-theme="${savedTheme}"]`);
    savedButton.dispatchEvent(event);
    updateToggleIcon(savedTheme);
});
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("back_to_top");

  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;

    if (scrollTop > 200) {
      if (!btn.classList.contains("show-up") && btn.style.display !== "block") {
        btn.classList.remove("show-down");
        btn.classList.add("show-up");
        btn.style.display = "block";
      }
    } else {
      if (!btn.classList.contains("show-down") && btn.style.display === "block") {
        btn.classList.remove("show-up");
        btn.classList.add("show-down");

        setTimeout(() => {
          btn.style.display = "none";
        }, 500); 
      }
    }
  });

  btn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});
