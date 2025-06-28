function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    min: 60,
    second: 1
  };

  const arabicUnits = {
    year: ["سنة", "سنتين", "سنوات"],
    month: ["شهر", "شهرين", "أشهر"],
    day: ["يوم", "يومين", "أيام"],
    hour: ["ساعة", "ساعتين", "ساعات"],
    min: ["دقيقة", "دقيقتين", "دقائق"],
    second: ["ثانية", "ثانيتين", "ثوانٍ"]
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      let label;
      if (count === 1) {
        label = arabicUnits[unit][0];
      } else if (count === 2) {
        label = arabicUnits[unit][1];
      } else if (count >= 3 && count <= 10) {
        label = `${count} ${arabicUnits[unit][2]}`;
      } else {
        label = `${count} ${arabicUnits[unit][0]}`;
      }
      return `منذ ${label}`;
    }
  }

  return "الآن";
}

document.querySelectorAll(".time_ago").forEach(element => {
  const dateTime = element.textContent.trim();
  element.textContent = getTimeAgo(dateTime);
});
