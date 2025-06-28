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

  const englishUnits = {
    year: ["year", "2 years", "years"],
    month: ["month", "2 months", "months"],
    day: ["day", "2 days", "days"],
    hour: ["hour", "2 hours", "hours"],
    min: ["minute", "2 minutes", "minutes"],
    second: ["second", "2 seconds", "seconds"]
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      let label;
      if (count === 1) {
        label = englishUnits[unit][0];
      } else if (count === 2) {
        label = englishUnits[unit][1];
      } else if (count >= 3 && count <= 10) {
        label = `${count} ${englishUnits[unit][2]}`;
      } else {
        label = `${count} ${englishUnits[unit][0]}`;
      }
      return `before ${label}`;
    }
  }

  return "just now";
}

document.querySelectorAll(".time_ago").forEach(element => {
  const dateTime = element.textContent.trim();
  element.textContent = getTimeAgo(dateTime);
});
