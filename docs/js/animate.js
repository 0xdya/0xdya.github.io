document.querySelectorAll('.card').forEach((card, i) => {
  card.setAttribute('data-aos-delay', i * 100);
});

AOS.init({ duration: 400, once: true, easing: 'ease-out-quart' });
