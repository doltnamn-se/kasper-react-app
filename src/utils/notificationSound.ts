class NotificationSoundManager {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio object
    this.audio = new Audio('/sounds/notification.wav');
    this.audio.volume = 0.5; // Set default volume to 50%
    this.audio.preload = 'auto';
    
    // Load sound settings from localStorage
    const savedSettings = localStorage.getItem('chatSoundEnabled');
    this.isEnabled = savedSettings !== null ? JSON.parse(savedSettings) : true;

    // Handle audio loading errors with fallback
    this.audio.addEventListener('error', () => {
      console.log('External notification sound failed to load, using Web Audio API fallback');
    });
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
      if (this.audio && !this.audio.error) {
        // Reset audio to beginning in case it was playing
        this.audio.currentTime = 0;
        await this.audio.play();
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
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // Test the notification sound
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