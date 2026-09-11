import React, { createContext, useContext, useState, useEffect } from 'react';
import { speechService } from '../services/speechService';
import { CULTURAL_TRANSLATIONS, REGIONAL_LANGUAGES } from '../services/culturalData';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  // Load saved preferences or defaults
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('ns_fontSize') || 'large');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ns_theme');
    return (saved === 'warm_sepia' || saved === 'standard') ? saved : 'standard';
  });
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('ns_reducedMotion') === 'true');
  const [autoVoiceRead, setAutoVoiceRead] = useState(() => localStorage.getItem('ns_autoVoiceRead') !== 'false');
  const [largeButtons, setLargeButtons] = useState(() => localStorage.getItem('ns_largeButtons') !== 'false');
  const [language, setLanguage] = useState(() => localStorage.getItem('ns_language') || 'en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Apply classes to document root for global CSS scaling & theme
  useEffect(() => {
    const root = document.documentElement;
    
    // Font scale
    root.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl');
    root.classList.add(`font-scale-${fontSize === 'small' ? 'sm' : fontSize === 'medium' ? 'md' : fontSize === 'large' ? 'lg' : 'xl'}`);
    localStorage.setItem('ns_fontSize', fontSize);

    // High Contrast Theme (Only standard and warm_sepia / brown theme)
    root.classList.remove('theme-yellow_black', 'theme-cyan_dark', 'theme-warm_sepia');
    if (theme === 'warm_sepia') {
      root.classList.add('theme-warm_sepia');
    }
    localStorage.setItem('ns_theme', theme);

    // Reduced Motion
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    localStorage.setItem('ns_reducedMotion', reducedMotion.toString());

    // Large Buttons
    if (largeButtons) {
      root.classList.add('large-buttons');
    } else {
      root.classList.remove('large-buttons');
    }
    localStorage.setItem('ns_largeButtons', largeButtons.toString());

    localStorage.setItem('ns_autoVoiceRead', autoVoiceRead.toString());
    localStorage.setItem('ns_language', language);
  }, [fontSize, theme, reducedMotion, largeButtons, autoVoiceRead, language]);

  // Voice narration helper
  const speakText = (text, options = {}) => {
    if (!text) return;
    setIsSpeaking(true);
    speechService.speak(text, {
      ...options,
      lang: options.lang || language,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const stopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  const baseT = CULTURAL_TRANSLATIONS[language] || CULTURAL_TRANSLATIONS.en;
  const t = new Proxy(baseT, {
    get: (target, prop) => {
      if (prop in target && target[prop] !== undefined) return target[prop];
      return (CULTURAL_TRANSLATIONS.en && CULTURAL_TRANSLATIONS.en[prop]) || '';
    }
  });


  const cycleFontSize = (speak = autoVoiceRead) => {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const nextIdx = (sizes.indexOf(fontSize) + 1) % sizes.length;
    const nextSize = sizes[nextIdx];
    setFontSize(nextSize);
    if (speak) {
      const sizeLabel = t[nextSize] || nextSize;
      const prefix = t.textSizeAnnounce || t.textSize || 'Text size:';
      speakText(`${prefix} ${sizeLabel}`);
    }
    return nextSize;
  };

  const cycleTheme = (speak = autoVoiceRead) => {
    const nextTheme = theme === 'standard' ? 'warm_sepia' : 'standard';
    setTheme(nextTheme);
    if (speak) {
      const themeLabel = nextTheme === 'warm_sepia' ? (t.warmBrown || 'Warm Brown') : (t.defaultTheme || 'Default');
      speakText(`${t.theme || 'Theme'}: ${themeLabel}`);
    }
    return nextTheme;
  };

  const changeLanguage = (newLangCode) => {
    if (!newLangCode) return;
    setLanguage(newLangCode);
    localStorage.setItem('ns_language', newLangCode);

    const targetDict = CULTURAL_TRANSLATIONS[newLangCode] || CULTURAL_TRANSLATIONS.en;
    const spokenMessage = targetDict.langChanged || `${newLangCode} selected.`;
    speechService.speak(spokenMessage, { lang: newLangCode });
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        theme,
        setTheme,
        reducedMotion,
        setReducedMotion,
        autoVoiceRead,
        setAutoVoiceRead,
        largeButtons,
        setLargeButtons,
        language,
        setLanguage,
        changeLanguage,
        speakText,
        stopSpeaking,
        isSpeaking,
        t,
        cycleFontSize,
        cycleTheme,
        availableLanguages: REGIONAL_LANGUAGES
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
