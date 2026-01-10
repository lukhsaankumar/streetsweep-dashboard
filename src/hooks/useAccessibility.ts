import { useState, useEffect, useCallback } from 'react';

const ACCESSIBILITY_KEY = 'streetsweep_accessibility';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem(ACCESSIBILITY_KEY);
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggleHighContrast = useCallback(() => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleLargeText = useCallback(() => {
    setSettings(prev => ({ ...prev, largeText: !prev.largeText }));
  }, []);

  return {
    highContrast: settings.highContrast,
    largeText: settings.largeText,
    toggleHighContrast,
    toggleLargeText,
  };
}
