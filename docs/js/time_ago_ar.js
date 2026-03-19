const ArTime = (() => {
  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  const arabicUnits = {
    year: ["سنة", "سنتين", "سنوات", "سنة"],
    month: ["شهر", "شهرين", "أشهر", "شهراً"],
    day: ["يوم", "يومين", "أيام", "يوماً"],
    hour: ["ساعة", "ساعتين", "ساعات", "ساعة"],
    minute: ["دقيقة", "دقيقتين", "دقائق", "دقيقة"],
    second: ["ثانية", "ثانيتين", "ثوانٍ", "ثانية"]
  };

  const format = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 5) return "الآن";

    for (const [unit, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count >= 1) {
        if (count === 1) return `منذ ${arabicUnits[unit][0]}`;
        if (count === 2) return `منذ ${arabicUnits[unit][1]}`;
        if (count >= 3 && count <= 10) return `منذ ${count} ${arabicUnits[unit][2]}`;
        return `منذ ${count} ${arabicUnits[unit][3]}`;
      }
    }
    return "منذ مدة";
  };

  const init = (selector = ".artime") => {
    const updateElements = () => {
      document.querySelectorAll(selector).forEach(el => {
        const rawDate = el.dataset.date || el.textContent.trim();
        if (!el.dataset.date) el.dataset.date = rawDate; 
        el.textContent = format(rawDate);
      });
    };

    updateElements();
    setInterval(updateElements, 60000);
  };

  return { format, init };
})();

ArTime.init(".time_ago");