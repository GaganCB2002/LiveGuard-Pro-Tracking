async function updateStats() {
  try {
    const cpu = await window.require('systeminformation').currentLoad();
    const mem = await window.require('systeminformation').mem();
    document.getElementById('cpu').textContent = cpu.currentLoad.toFixed(1) + '%';
    document.getElementById('ram').textContent = ((mem.used / mem.total) * 100).toFixed(1) + '%';
  } catch (e) { console.error(e); }
}
setInterval(updateStats, 5000);
updateStats();
