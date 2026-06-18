import { Audio } from "expo-av";

let incomingSound = null;
let outgoingSound = null;

export async function playNotificationSound() {
  try {
    if (!incomingSound) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: "https://cdn.pixabay.com/download/audio/2022/02/22/audio_d2a8f7a6b6.mp3?filename=notification-message-38758.mp3" },
        { shouldPlay: true }
      );
      incomingSound = sound;
    } else {
      await incomingSound.replayAsync();
    }
  } catch (e) {
    // Silently fail
  }
}

export async function playOutgoingSound() {
  try {
    if (!outgoingSound) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: "https://cdn.pixabay.com/download/audio/2022/02/22/audio_d2a8f7a6b6.mp3?filename=notification-message-38758.mp3" },
        { shouldPlay: true }
      );
      outgoingSound = sound;
    } else {
      await outgoingSound.replayAsync();
    }
  } catch (e) {
    // Silently fail
  }
}

export async function sendLocalNotification(title, body) {
  console.log(`[Notification] ${title}: ${body}`);
}

export async function requestNotificationPermissions() {
  return { granted: true };
}

export async function getExpoPushToken() {
  return null;
}
