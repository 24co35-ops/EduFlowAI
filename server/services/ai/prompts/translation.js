/**
 * Multilingual Translation Prompt Builder (Granite 20B Multilingual)
 */

function buildTranslationPrompt(text, targetLang = 'hi') {
  const langMap = {
    hi: 'Hindi (हिंदी)',
    mr: 'Marathi (मराठी)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    kn: 'Kannada (ಕನ್ನಡ)',
    bn: 'Bengali (বাংলা)',
    gu: 'Gujarati (ગુજરાતી)',
    en: 'English'
  };

  const targetLangName = langMap[targetLang] || 'Hindi';
  const safeText = String(text || '').slice(0, 4000);

  return `System: You are an expert multilingual educational translator powered by IBM watsonx.ai Granite 20B Multilingual.
Translate the following curriculum text into fluent ${targetLangName}. 
Preserve educational terminology, JSON formatting (if input is JSON), and markdown formatting.

Text to translate:
${safeText}`;
}

module.exports = { buildTranslationPrompt };
