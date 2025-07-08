document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
      duration: 600,
      easing: 'ease',
      once: true
    });

    // fallback إذا لم تُعرض العناصر
    setTimeout(() => {
      document.querySelectorAll('[data-aos]').forEach(el => {
        if (!el.classList.contains('aos-animate')) {
          el.removeAttribute('data-aos');
        }
      });
    }, 3000);
  });