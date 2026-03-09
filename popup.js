document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: "get_attendance" }, (data) => {
    if (!data || data.error) {
      document.getElementById('raw').innerText = data?.error || "Error connecting.";
      return;
    }

    document.getElementById('course').innerText = data.course;
    document.getElementById('percent').innerText = data.percent + "%";
    document.getElementById('raw').innerText = `Record: ${data.present} / ${data.total}`;

    const adviceBox = document.getElementById('advice-box');
    adviceBox.style.display = 'block';

    const target = 0.75;
    if (data.present / data.total >= target) {
      const canSkip = Math.floor((data.present / target) - data.total);
      adviceBox.className = "advice safe";
      adviceBox.innerText = `Chill! You can skip ${canSkip} more classes.`;
    } else {
      const mustAttend = Math.ceil((target * data.total - data.present) / (1 - target));
      adviceBox.className = "advice danger";
      adviceBox.innerText = `Warning! Attend ${mustAttend} more classes to reach 75%.`;
    }
  });
});