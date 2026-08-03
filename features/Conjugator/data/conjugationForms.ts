/**
 * Japanese Verb Conjugation Form Definitions
 *
 * This module defines all 30+ conjugation forms organized by category.
 * Each form definition includes metadata for display and categorization.
 *
 * Requirements: 3.1-3.13
 */

import type { FormDefinition, ConjugationCategory, Formality } from '../types';

// ============================================================================
// Form Definitions
// ============================================================================

/**
 * All conjugation form definitions organized by category
 * Requirements: 3.1-3.13
 */
export const CONJUGATION_FORMS: FormDefinition[] = [
  // ============================================================================
  // Basic Forms (Requirements: 3.1)
  // ============================================================================
  {
    id: 'dictionary',
    category: 'basic',
    name: 'Thể từ điển',
    nameJa: '辞書形',
    formality: 'plain',
  },
  {
    id: 'te',
    category: 'basic',
    name: 'Thể Te',
    nameJa: 'て形',
    formality: 'plain',
  },

  // ============================================================================
  // Polite Forms (Requirements: 3.2)
  // ============================================================================
  {
    id: 'masu',
    category: 'polite',
    name: 'Thể Masu',
    nameJa: 'ます形',
    formality: 'polite',
  },
  {
    id: 'masen',
    category: 'polite',
    name: 'Thể Masen (Phủ định lịch sự)',
    nameJa: 'ません',
    formality: 'polite',
  },
  {
    id: 'mashita',
    category: 'polite',
    name: 'Thể Mashita (Quá khứ lịch sự)',
    nameJa: 'ました',
    formality: 'polite',
  },
  {
    id: 'masen-deshita',
    category: 'polite',
    name: 'Thể Masen Deshita (Quá khứ phủ định lịch sự)',
    nameJa: 'ませんでした',
    formality: 'polite',
  },

  // ============================================================================
  // Negative Forms (Requirements: 3.1)
  // ============================================================================
  {
    id: 'nai',
    category: 'negative',
    name: 'Thể Nai (Phủ định thường)',
    nameJa: 'ない形',
    formality: 'plain',
  },
  {
    id: 'nakatta',
    category: 'negative',
    name: 'Thể Nakatta (Quá khứ phủ định thường)',
    nameJa: 'なかった形',
    formality: 'plain',
  },

  // ============================================================================
  // Past Forms (Requirements: 3.1)
  // ============================================================================
  {
    id: 'ta',
    category: 'past',
    name: 'Thể Ta (Quá khứ thường)',
    nameJa: 'た形',
    formality: 'plain',
  },

  // ============================================================================
  // Volitional Forms (Requirements: 3.3)
  // ============================================================================
  {
    id: 'volitional-plain',
    category: 'volitional',
    name: 'Thể ý chí (Thường)',
    nameJa: '意向形',
    formality: 'plain',
  },
  {
    id: 'volitional-polite',
    category: 'volitional',
    name: 'Thể ý chí (Lịch sự)',
    nameJa: 'ましょう',
    formality: 'polite',
  },

  // ============================================================================
  // Potential Forms (Requirements: 3.4)
  // ============================================================================
  {
    id: 'potential-plain',
    category: 'potential',
    name: 'Thể khả năng (Thường)',
    nameJa: '可能形',
    formality: 'plain',
  },
  {
    id: 'potential-polite',
    category: 'potential',
    name: 'Thể khả năng (Lịch sự)',
    nameJa: '可能形丁寧',
    formality: 'polite',
  },
  {
    id: 'potential-negative',
    category: 'potential',
    name: 'Thể khả năng (Phủ định)',
    nameJa: '可能形否定',
    formality: 'plain',
  },

  // ============================================================================
  // Passive Forms (Requirements: 3.5)
  // ============================================================================
  {
    id: 'passive-plain',
    category: 'passive',
    name: 'Thể bị động (Thường)',
    nameJa: '受身形',
    formality: 'plain',
  },
  {
    id: 'passive-polite',
    category: 'passive',
    name: 'Thể bị động (Lịch sự)',
    nameJa: '受身形丁寧',
    formality: 'polite',
  },

  // ============================================================================
  // Causative Forms (Requirements: 3.6)
  // ============================================================================
  {
    id: 'causative-plain',
    category: 'causative',
    name: 'Thể sai khiến (Thường)',
    nameJa: '使役形',
    formality: 'plain',
  },
  {
    id: 'causative-polite',
    category: 'causative',
    name: 'Thể sai khiến (Lịch sự)',
    nameJa: '使役形丁寧',
    formality: 'polite',
  },

  // ============================================================================
  // Causative-Passive Forms (Requirements: 3.7)
  // ============================================================================
  {
    id: 'causative-passive-plain',
    category: 'causative-passive',
    name: 'Thể sai khiến bị động (Thường)',
    nameJa: '使役受身形',
    formality: 'plain',
  },
  {
    id: 'causative-passive-polite',
    category: 'causative-passive',
    name: 'Thể sai khiến bị động (Lịch sự)',
    nameJa: '使役受身形丁寧',
    formality: 'polite',
  },

  // ============================================================================
  // Imperative Forms (Requirements: 3.8)
  // ============================================================================
  {
    id: 'imperative-plain',
    category: 'imperative',
    name: 'Thể mệnh lệnh (Thường)',
    nameJa: '命令形',
    formality: 'plain',
  },
  {
    id: 'imperative-polite',
    category: 'imperative',
    name: 'Thể mệnh lệnh (Lịch sự)',
    nameJa: 'てください',
    formality: 'polite',
  },
  {
    id: 'imperative-negative',
    category: 'imperative',
    name: 'Thể mệnh lệnh phủ định (Cấm đoán)',
    nameJa: '禁止形',
    formality: 'plain',
  },

  // ============================================================================
  // Conditional Forms (Requirements: 3.9, 3.10)
  // ============================================================================
  {
    id: 'conditional-ba',
    category: 'conditional',
    name: 'Thể điều kiện -ba',
    nameJa: 'ば形',
    formality: 'plain',
  },
  {
    id: 'conditional-tara',
    category: 'conditional',
    name: 'Thể điều kiện -tara',
    nameJa: 'たら形',
    formality: 'plain',
  },
  {
    id: 'conditional-nara',
    category: 'conditional',
    name: 'Thể điều kiện -nara',
    nameJa: 'なら形',
    formality: 'plain',
  },

  // ============================================================================
  // Tai-form (Want to) (Requirements: 3.11)
  // ============================================================================
  {
    id: 'tai',
    category: 'tai-form',
    name: 'Thể Tai (Muốn làm)',
    nameJa: 'たい形',
    formality: 'plain',
  },
  {
    id: 'takunai',
    category: 'tai-form',
    name: 'Thể Takunai (Không muốn làm)',
    nameJa: 'たくない',
    formality: 'plain',
  },
  {
    id: 'takatta',
    category: 'tai-form',
    name: 'Thể Takatta (Đã muốn làm)',
    nameJa: 'たかった',
    formality: 'plain',
  },
  {
    id: 'takunakatta',
    category: 'tai-form',
    name: 'Thể Takunakatta (Đã không muốn làm)',
    nameJa: 'たくなかった',
    formality: 'plain',
  },

  // ============================================================================
  // Progressive Forms (Requirements: 3.12)
  // ============================================================================
  {
    id: 'progressive-present',
    category: 'progressive',
    name: 'Thể Te-iru (Đang làm/Tiếp diễn)',
    nameJa: 'ている',
    formality: 'plain',
  },
  {
    id: 'progressive-past',
    category: 'progressive',
    name: 'Thể Te-ita (Đã đang làm/Quá khứ tiếp diễn)',
    nameJa: 'ていた',
    formality: 'plain',
  },

  // ============================================================================
  // Honorific Forms (Requirements: 3.13)
  // ============================================================================
  {
    id: 'honorific-respectful',
    category: 'honorific',
    name: 'Tôn kính ngữ (O-verb-ni-naru)',
    nameJa: 'お〜になる',
    formality: 'polite',
  },
  {
    id: 'honorific-humble',
    category: 'honorific',
    name: 'Khiêm nhường ngữ (O-verb-suru)',
    nameJa: 'お〜する',
    formality: 'polite',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all form definitions for a specific category
 */
export function getFormsByCategory(
  category: ConjugationCategory,
): FormDefinition[] {
  return CONJUGATION_FORMS.filter(form => form.category === category);
}

/**
 * Get a form definition by its ID
 */
export function getFormById(id: string): FormDefinition | undefined {
  return CONJUGATION_FORMS.find(form => form.id === id);
}

/**
 * Get all form definitions for a specific formality level
 */
export function getFormsByFormality(formality: Formality): FormDefinition[] {
  return CONJUGATION_FORMS.filter(form => form.formality === formality);
}

/**
 * Get all unique categories from the form definitions
 */
export function getAllCategories(): ConjugationCategory[] {
  const categories = new Set<ConjugationCategory>();
  CONJUGATION_FORMS.forEach(form => categories.add(form.category));
  return Array.from(categories);
}

/**
 * Category display names in English and Japanese
 */
export const CATEGORY_NAMES: Record<
  ConjugationCategory,
  { en: string; ja: string }
> = {
  basic: { en: 'Basic Forms', ja: '基本形' },
  polite: { en: 'Polite Forms', ja: '丁寧形' },
  negative: { en: 'Negative Forms', ja: '否定形' },
  past: { en: 'Past Forms', ja: '過去形' },
  volitional: { en: 'Volitional Forms', ja: '意向形' },
  potential: { en: 'Potential Forms', ja: '可能形' },
  passive: { en: 'Passive Forms', ja: '受身形' },
  causative: { en: 'Causative Forms', ja: '使役形' },
  'causative-passive': { en: 'Causative-Passive Forms', ja: '使役受身形' },
  imperative: { en: 'Imperative Forms', ja: '命令形' },
  conditional: { en: 'Conditional Forms', ja: '条件形' },
  'tai-form': { en: 'Desire Forms (Tai)', ja: 'たい形' },
  progressive: { en: 'Progressive Forms', ja: '進行形' },
  honorific: { en: 'Honorific Forms', ja: '敬語' },
};

/**
 * Order of categories for display
 */
export const CATEGORY_ORDER: ConjugationCategory[] = [
  'basic',
  'polite',
  'negative',
  'past',
  'volitional',
  'potential',
  'passive',
  'causative',
  'causative-passive',
  'imperative',
  'conditional',
  'tai-form',
  'progressive',
  'honorific',
];
