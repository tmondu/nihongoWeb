'use client';

/**
 * Text-to-speech helper for Japanese phrases in Curriculum
 */
export function playJapaneseSpeech(text: string, rate: number = 0.9): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    // Clean text from bracket syntax: [漢字:かんじ] -> 漢字
    const cleanText = text.replace(/\[(.*?):(.*?)]/g, '$1').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(
      v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja'),
    );
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Speech synthesis error:', error);
  }
}
