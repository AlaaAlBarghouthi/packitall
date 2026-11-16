// Seasonal events. Holiday season: 1 December – 7 January.
// Preview any time with ?xmas in the URL (remembered on this device); ?noxmas turns the preview off.
const q = location.search;
try {
  if (/[?&]xmas\b/.test(q)) localStorage.setItem('pia_xmas', '1');
  if (/[?&]noxmas\b/.test(q)) localStorage.removeItem('pia_xmas');
} catch (e) {}

export function xmasActive() {
  if (/[?&]noxmas\b/.test(q)) return false;
  try { if (localStorage.getItem('pia_xmas') === '1') return true; } catch (e) {}
  const d = new Date(), m = d.getMonth(), day = d.getDate();
  return m === 11 || (m === 0 && day <= 7);
}
export function xmasEndsAt() {
  const d = new Date(); const y = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
  return new Date(y, 0, 8, 0, 0, 0).getTime();
}
