import { readHapticEnabled } from './storage';

interface CapacitorWindow extends Window {
  Capacitor?: {
    isNativePlatform?: () => boolean;
    Plugins?: {
      Haptics?: {
        impact?: (options: { style: 'LIGHT' | 'MEDIUM' | 'HEAVY' }) => Promise<void> | void;
      };
    };
  };
}

/**
 * Triggers native Capacitor light impact haptic when available,
 * falling back to navigator.vibrate(12) on standard Android WebViews.
 * Respects the saved Haptic feedback toggle state.
 */
export function triggerHaptic(forceOverride?: boolean): void {
  const enabled = forceOverride !== undefined ? forceOverride : readHapticEnabled();
  if (!enabled) {
    return;
  }

  try {
    const capWindow = window as CapacitorWindow;
    const hapticsPlugin = capWindow.Capacitor?.Plugins?.Haptics;
    if (hapticsPlugin && typeof hapticsPlugin.impact === 'function') {
      void hapticsPlugin.impact({ style: 'LIGHT' });
      return;
    }

    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(12);
    }
  } catch {
    // Ignore unsupported platform vibration errors
  }
}
