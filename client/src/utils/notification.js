let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(frequency, duration, startTime, volume = 0.15) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playIncomingSound() {
  try {
    const now = getAudioContext().currentTime;
    playTone(523.25, 0.12, now);
    playTone(659.25, 0.12, now + 0.1);
    playTone(783.99, 0.25, now + 0.2);
  } catch (e) {
    // Web Audio API unavailable
  }
}

export function playOutgoingSound() {
  try {
    const now = getAudioContext().currentTime;
    playTone(659.25, 0.08, now, 0.1);
    playTone(523.25, 0.1, now + 0.08, 0.1);
  } catch (e) {
    // Web Audio API unavailable
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function sendNotification(title, body) {
  if (
    'Notification' in window &&
    Notification.permission === 'granted' &&
    !document.hasFocus()
  ) {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        silent: true,
      });
      setTimeout(() => notification.close(), 5000);
    } catch (e) {
      // Notification not supported
    }
  }
}
