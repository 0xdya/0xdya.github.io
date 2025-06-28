// theme
    document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const dropdown = document.getElementById('themeDropdown');
    const buttons = dropdown.querySelectorAll('button');

    // رموز الثيم
const themeIcons = {
    light: 'sunny-outline',
    dark: 'moon-outline',
    system: 'contrast-outline'
};
function updateToggleIcon(theme) {
    const iconName = themeIcons[theme] || 'contrast-outline';

    // إزالة أي أيقونة قديمة
    while (themeToggle.firstChild) {
        themeToggle.removeChild(themeToggle.firstChild);
    }

    // إنشاء أيقونة جديدة
    const icon = document.createElement('ion-icon');
    icon.setAttribute('name', iconName);
    themeToggle.appendChild(icon);
}
    // عرض/إخفاء القائمة
    themeToggle.addEventListener('click', () => {
        dropdown.classList.toggle('show');
    });

    // تغيير الثيم
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;

            // إزالة جميع كلاسات الثيم
            document.body.classList.remove('dark_theme', 'light_theme');

            // إضافة الكلاس المناسب
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

            // حفظ التفضيل وتحديث الأيقونة
            localStorage.setItem('theme', theme);
            updateToggleIcon(theme);
            dropdown.classList.remove('show');
        });
    });

    // تحميل الثيم المحفوظ
    const savedTheme = localStorage.getItem('theme') || 'system';
    const event = new Event('click');
    const savedButton = dropdown.querySelector(`[data-theme="${savedTheme}"]`);
    savedButton.dispatchEvent(event);
    updateToggleIcon(savedTheme);
});
// back_to_top 
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("back_to_top");

  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;

    if (scrollTop > 200) {
      // إظهار الزر بتأثير الصعود إذا لم يكن ظاهراً أو قيد الهبوط
      if (!btn.classList.contains("show-up") && btn.style.display !== "block") {
        btn.classList.remove("show-down");
        btn.classList.add("show-up");
        btn.style.display = "block";
      }
    } else {
      // إخفاء الزر بتأثير الهبوط إذا كان ظاهراً أو قيد الصعود
      if (!btn.classList.contains("show-down") && btn.style.display === "block") {
        btn.classList.remove("show-up");
        btn.classList.add("show-down");

        // إخفاء الزر بعد انتهاء الأنميشن
        setTimeout(() => {
          btn.style.display = "none";
        }, 500); // نفس مدة الأنميشن
      }
    }
  });

  // التنقل السلس للأعلى عند الضغط على الزر
  btn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});

AOS.init();