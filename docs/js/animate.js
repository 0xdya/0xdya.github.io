gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray(".ScrollTrigger").forEach((el, i) => {
  gsap.from(el, {
    y: 80,
    opacity: 0,
    duration: 1,
    ease: "power4.out",
    delay: i * 0.2,
    scrollTrigger: {
      trigger: el,
      start: "top 100%",
      toggleActions: "play none none none",
      once: true,
    }
  });
});
