import React from 'react';
import { Volume2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function AudioButton({ textToRead, title = "Listen", size = "md", className = "" }) {
  const { speakText } = useAccessibility();

  const handleSpeak = (e) => {
    e.stopPropagation();
    speakText(textToRead);
  };

  const sizeClasses = size === "sm" ? "w-8 h-8 p-1.5" : (size === "lg" ? "w-12 h-12 p-3" : "w-10 h-10 p-2");

  return (
    <button
      onClick={handleSpeak}
      className={`rounded-full bg-teal-100 hover:bg-teal-200 text-teal-800 border border-teal-300 transition flex items-center justify-center shadow-sm shrink-0 ${sizeClasses} ${className}`}
      title={`Listen: "${textToRead}"`}
      aria-label={`Read aloud: ${textToRead}`}
    >
      <Volume2 className="w-full h-full" />
    </button>
  );
}
