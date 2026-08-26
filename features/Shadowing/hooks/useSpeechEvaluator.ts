'use client';

import { useState, useCallback } from 'react';

export interface WordMatchResult {
  char: string;
  isMatched: boolean;
}

// Thuật toán so khớp ký tự chi tiết giữa câu mẫu và câu người học đọc
export function diffJapaneseText(
  target: string,
  spoken: string,
): { score: number; results: WordMatchResult[] } {
  const cleanTarget = target.replace(/[^\p{L}\p{N}]/gu, '');
  const cleanSpoken = spoken.replace(/[^\p{L}\p{N}]/gu, '');

  if (!cleanTarget) return { score: 0, results: [] };
  if (!cleanSpoken) {
    return {
      score: 0,
      results: cleanTarget.split('').map(char => ({ char, isMatched: false })),
    };
  }

  let matchedCount = 0;
  const results: WordMatchResult[] = [];

  // So khớp từng ký tự
  for (let i = 0; i < cleanTarget.length; i++) {
    const char = cleanTarget[i];
    // Ký tự có xuất hiện trong vùng tương ứng của spoken không
    const windowStart = Math.max(0, i - 2);
    const windowEnd = Math.min(cleanSpoken.length, i + 3);
    const windowSlice = cleanSpoken.slice(windowStart, windowEnd);

    const isMatched = windowSlice.includes(char);
    if (isMatched) matchedCount++;

    results.push({ char, isMatched });
  }

  const score = Math.round((matchedCount / cleanTarget.length) * 100);
  return {
    score: Math.min(100, Math.max(0, score)),
    results,
  };
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export function useSpeechEvaluator() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);
  const [diffResults, setDiffResults] = useState<WordMatchResult[]>([]);
  const [isSupported, setIsSupported] = useState(true);

  const evaluateSpeech = useCallback(
    (
      targetText: string,
      onFinish?: (
        finalScore: number,
        finalTranscript: string,
        finalDiff: WordMatchResult[],
      ) => void,
    ) => {
      setTranscript('');
      setScore(null);
      setDiffResults([]);

      const SpeechRecognitionClass =
        (typeof window !== 'undefined' &&
          ((window as unknown as { SpeechRecognition?: new () => unknown })
            .SpeechRecognition ||
            (
              window as unknown as {
                webkitSpeechRecognition?: new () => unknown;
              }
            ).webkitSpeechRecognition)) ||
        null;

      if (!SpeechRecognitionClass) {
        setIsSupported(false);
        return;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new (SpeechRecognitionClass as any)();
        recognition.lang = 'ja-JP';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const speechResult = event.results[0][0].transcript;
          setTranscript(speechResult);

          const { score: calculatedScore, results } = diffJapaneseText(
            targetText,
            speechResult,
          );
          setScore(calculatedScore);
          setDiffResults(results);

          if (onFinish) {
            onFinish(calculatedScore, speechResult, results);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch {
        setIsListening(false);
      }
    },
    [],
  );

  const clearEvaluation = useCallback(() => {
    setTranscript('');
    setScore(null);
    setDiffResults([]);
  }, []);

  return {
    isListening,
    transcript,
    score,
    diffResults,
    isSupported,
    evaluateSpeech,
    clearEvaluation,
  };
}
