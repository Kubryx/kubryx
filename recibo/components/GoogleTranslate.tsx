'use client';

import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function GoogleTranslate() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // 1. Read current language from Google's cookie
    const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
    if (match) {
      const parts = match[2].split('/');
      if (parts.length > 2) {
        setLang(parts[2]);
      }
    }

    // 2. Load the Google Translate script silently
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', autoDisplay: false },
          'google_translate_element'
        );
      };
    }
  }, []);

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLang(newLang);
    
    // Clear the cookie if reverting to English
    if (newLang === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    } else {
      // Set the translation cookie (From English -> Target)
      document.cookie = `googtrans=/en/${newLang}; path=/;`;
      document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname};`;
    }
    
    // Reload to apply the translation natively via Google's script
    window.location.reload();
  };

  return (
    <>
      {/* Hidden element required by Google Translate */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      
      {/* Our Custom Native UI */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-stone-900 bg-white hover:bg-amber-50 transition-colors shadow-[2px_2px_0px_#2D2323] cursor-pointer">
        <Globe size={16} className="text-[#FF6B6B]" />
        <select 
          value={lang} 
          onChange={changeLanguage}
          className="bg-transparent text-sm font-semibold text-stone-900 outline-none cursor-pointer appearance-none pr-2 font-[var(--font-jakarta)]"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="pt">Português</option>
        </select>
      </div>

      {/* Force-hide any straggler Google UI elements */}
      <style dangerouslySetInnerHTML={{__html: `
        .goog-te-banner-frame { display: none !important; }
        body { top: 0px !important; }
        #goog-gt-tt { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        .skiptranslate > iframe { display: none !important; }
      `}} />
    </>
  );
}
