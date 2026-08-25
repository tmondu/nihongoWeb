'use client';

import { useState, useCallback } from 'react';

// Hàm tính độ tương đồng chuỗi Levenshtein Distance
function calculateSimilarity(s1: string, s2: string): number {
  const clean1 = s1.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
  const clean2 = s2.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

  if (!clean1 || !clean2) return 0;
  if (clean1 === clean2) return 100;

  const longer = clean1.length > clean2.length ? clean1 : clean2;
  const shorter = clean1.length > clean2.length ? clean2 : clean1;
  const longerLength = longer.length;

  let costs = Array.from({ length: shorter.length + 1 }, (_, i) => i);
  for (let i = 0; i < longer.length; i++) {
    const newCosts = [i + 1];
    for (let j = 0; j < shorter.length; j++) {
      const cost = longer[i] === shorter[j] ? 0 : 1;
      newCosts.push(
        Math.min(newCosts[j] + 1, costs[j + 1] + 1, costs[j] + cost),
      );
    }
    costs = newCosts;
  }

  const distance = costs[shorter.length];
  const score = Math.round(((longerLength - distance) / longerLength) * 100);
  return Math.max(0, Math.min(100, score));
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
  const [isSupported, setIsSupported] = useState(true);

  const evaluateSpeech = useCallback(
    (
      targetText: string,
      onFinish?: (finalScore: number, finalTranscript: string) => void,
    ) => {
      setTranscript('');
      setScore(null);

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
          const similarityScore = calculateSimilarity(targetText, speechResult);
          setScore(similarityScore);
          if (onFinish) {
            onFinish(similarityScore, speechResult);
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

  return {
    isListening,
    transcript,
    score,
    isSupported,
    evaluateSpeech,
  };
}
