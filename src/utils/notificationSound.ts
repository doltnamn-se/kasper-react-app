export interface NotificationSound {
  id: string;
  name: string;
  file: string;
  description: string;
}

export const NOTIFICATION_SOUNDS: NotificationSound[] = [
  { id: 'bell', name: 'Bell', file: '/sounds/notification.wav', description: 'Classic bell ring' },
  { id: 'chime', name: 'Chime', file: '/sounds/chime.wav', description: 'Gentle chime tone' },
  { id: 'ding', name: 'Ding', file: '/sounds/ding.wav', description: 'Simple ding sound' },
  { id: 'pop', name: 'Pop', file: '/sounds/pop.wav', description: 'Light pop sound' },
  { id: 'whistle', name: 'Whistle', file: '/sounds/whistle.wav', description: 'Short whistle tone' },
];

class NotificationSoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private isEnabled: boolean = true;
  private selectedSoundId: string = 'bell';
  private audioContext: AudioContext | null = null;

  constructor() {
    // Load sound settings from localStorage
    const savedSettings = localStorage.getItem('chatSoundEnabled');
    this.isEnabled = savedSettings !== null ? JSON.parse(savedSettings) : true;
    
    const savedSoundId = localStorage.getItem('chatSoundId');
    this.selectedSoundId = savedSoundId || 'bell';

    // Preload all sounds
    this.preloadSounds();
  }

  private preloadSounds() {
    NOTIFICATION_SOUNDS.forEach(sound => {
      const audio = new Audio(sound.file);
      audio.volume = 0.5;
      audio.preload = 'auto';
      
      audio.addEventListener('error', () => {
        console.log(`Sound ${sound.name} failed to load, will use fallback`);
      });
      
      this.audioCache.set(sound.id, audio);
    });
  }

  private getCurrentAudio(): HTMLAudioElement | null {
    return this.audioCache.get(this.selectedSoundId) || null;
  }

  // Create a simple notification beep using Web Audio API
  private async createBeepSound() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime); // 800 Hz tone
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // Play notification sound
  async playNotification() {
    if (!this.isEnabled) return;

    try {
      const audio = this.getCurrentAudio();
      if (audio && !audio.error) {
        // Reset audio to beginning in case it was playing
        audio.currentTime = 0;
        await audio.play();
      } else {
        // Fallback to Web Audio API beep
        await this.createBeepSound();
      }
    } catch (error) {
      console.log('Could not play notification sound:', error);
      // Try Web Audio API fallback
      try {
        await this.createBeepSound();
      } catch (fallbackError) {
        console.log('Fallback sound also failed:', fallbackError);
      }
    }
  }

  // Play a specific sound for preview
  async playSound(soundId: string) {
    try {
      const audio = this.audioCache.get(soundId);
      if (audio && !audio.error) {
        audio.currentTime = 0;
        await audio.play();
      } else {
        await this.createBeepSound();
      }
    } catch (error) {
      console.log('Could not play preview sound:', error);
      try {
        await this.createBeepSound();
      } catch (fallbackError) {
        console.log('Fallback sound also failed:', fallbackError);
      }
    }
  }

  // Set the selected sound
  setSelectedSound(soundId: string) {
    if (NOTIFICATION_SOUNDS.find(s => s.id === soundId)) {
      this.selectedSoundId = soundId;
      localStorage.setItem('chatSoundId', soundId);
    }
  }

  // Get the selected sound
  getSelectedSound(): string {
    return this.selectedSoundId;
  }

  // Enable/disable sound notifications
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('chatSoundEnabled', JSON.stringify(enabled));
  }

  // Check if sound is enabled
  isSound(): boolean {
    return this.isEnabled;
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume: number) {
    this.audioCache.forEach(audio => {
      audio.volume = Math.max(0, Math.min(1, volume));
    });
  }

  // Test the current notification sound
  async testSound() {
    await this.playNotification();
  }
}

// Create singleton instance
export const notificationSound = new NotificationSoundManager();

// Export utility functions
export const playNewMessageSound = () => {
  notificationSound.playNotification();
};

export const setSoundEnabled = (enabled: boolean) => {
  notificationSound.setEnabled(enabled);
};

export const isSoundEnabled = () => {
  return notificationSound.isSound();
};

export const testNotificationSound = () => {
  notificationSound.testSound();
};

export const setNotificationVolume = (volume: number) => {
  notificationSound.setVolume(volume);
};

export const setSelectedSound = (soundId: string) => {
  notificationSound.setSelectedSound(soundId);
};

export const getSelectedSound = () => {
  return notificationSound.getSelectedSound();
};

export const previewSound = (soundId: string) => {
  notificationSound.playSound(soundId);
};