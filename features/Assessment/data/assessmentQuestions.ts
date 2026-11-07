import {
  ASSESSMENT_N5_SEED_QUESTIONS,
  SeedQuestion,
} from './assessmentSeedData';
import { ASSESSMENT_N5_PART1B_QUESTIONS } from './assessmentSeedDataPart1B';
import { ASSESSMENT_N5_PART2A_QUESTIONS } from './assessmentSeedDataPart2A';
import { ASSESSMENT_N5_PART2B_QUESTIONS } from './assessmentSeedDataPart2B';

export type { SeedQuestion };

export const ALL_N5_ASSESSMENT_QUESTIONS: SeedQuestion[] = [
  ...ASSESSMENT_N5_SEED_QUESTIONS,
  ...ASSESSMENT_N5_PART1B_QUESTIONS,
  ...ASSESSMENT_N5_PART2A_QUESTIONS,
  ...ASSESSMENT_N5_PART2B_QUESTIONS,
];

export const TOTAL_QUESTIONS_COUNT = ALL_N5_ASSESSMENT_QUESTIONS.length; // 200
