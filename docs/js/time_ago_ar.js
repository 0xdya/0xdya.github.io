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
    year: ["سنة", "سنتين", "سنوات", "سنة"],
    month: ["شهر", "شهرين", "أشهر", "شهراً"],
    day: ["يوم", "يومين", "أيام", "يوماً"],
    hour: ["ساعة", "ساعتين", "ساعات", "ساعة"],
    min: ["دقيقة", "دقيقتين", "دقائق", "دقيقة"],
    second: ["ثانية", "ثانيتين", "ثوانٍ", "ثانية"]
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      let label;
      if (count === 1) {
        label = `منذ ${arabicUnits[unit][0]}`;
      } else if (count === 2) {
        label = `منذ ${arabicUnits[unit][1]}`;
      } else if (count >= 3 && count <= 10) {
        label = `منذ ${count} ${arabicUnits[unit][2]}`;
      } else {
        label = `منذ ${count} ${arabicUnits[unit][3]}`;
      }
      return label;
    }
  }
  return "الآن";
}

// تحديث كل العناصر التي تحتوي على التواريخ
document.querySelectorAll(".time_ago").forEach(element => {
  const dateTime = element.textContent.trim();
  element.textContent = getTimeAgo(dateTime);
});
