// The clock in the border: real Phuket time (world time plus 7 hours, all year, no summer time), each second.
let started = false;
export function startClock(): void {
  if (started) return;
  started = true;
  const els = [...document.querySelectorAll<HTMLElement>('.clock .time')];
  if (!els.length) return;
  const p = (n: number) => String(n).padStart(2, '0');
  const tick = () => {
    const t = new Date(Date.now() + 7 * 3600 * 1000);
    const s = `${p(t.getUTCHours())}:${p(t.getUTCMinutes())}:${p(t.getUTCSeconds())}`;
    for (const el of els) el.textContent = s;
    setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
  };
  tick();
}
