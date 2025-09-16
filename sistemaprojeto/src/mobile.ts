import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

export const initializeMobile = async () => {
  if (Capacitor.isNativePlatform()) {
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Default });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });

    // Hide splash screen after app loads
    await SplashScreen.hide();

    // Configure keyboard behavior
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.transform = `translateY(-${info.keyboardHeight / 4}px)`;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.transform = 'translateY(0px)';
    });

    // Prevent zoom on input focus
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  }
};

// Check if running in mobile app
export const isMobileApp = () => Capacitor.isNativePlatform();

// Get platform info
export const getPlatform = () => Capacitor.getPlatform();