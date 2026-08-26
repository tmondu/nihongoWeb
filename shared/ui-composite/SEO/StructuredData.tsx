import Script from 'next/script';

interface StructuredDataProps {
  // Accept schema-dts types and other JSON-LD shapes without forcing index signatures.
  data: unknown;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id='structured-data'
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Comprehensive Schema Graph for PThamSS
export const kanaDojoSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.pthamnihongo.site/#organization',
      name: 'PThamSS',
      url: 'https://www.pthamnihongo.site',
      logo: 'https://www.pthamnihongo.site/favicon.ico',
      description:
        'Nền tảng học tiếng Nhật Hiragana, Katakana, Kanji, Từ vựng, Flashcard Thamlet và Shadowing trực tuyến.',
      sameAs: ['https://github.com/tmondu/nihongoWeb'],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'dev@www.pthamnihongo.site',
        contactType: 'Customer Support',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.pthamnihongo.site/#website',
      url: 'https://www.pthamnihongo.site',
      name: 'PThamSS',
      description:
        'Làm chủ tiếng Nhật cùng PThamSS - Học Hiragana, Katakana, Kanji, Từ vựng, Thamlet & Shadowing',
      publisher: { '@id': 'https://www.pthamnihongo.site/#organization' },
      inLanguage: ['vi', 'en', 'es'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.pthamnihongo.site/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://www.pthamnihongo.site/#webapp',
      name: 'PThamSS',
      alternateName: 'PTham Nihongo',
      url: 'https://www.pthamnihongo.site',
      applicationCategory: 'EducationalApplication',
      applicationSubCategory: 'Language Learning',
      operatingSystem: 'Any',
      browserRequirements:
        'Requires JavaScript. Works with Chrome, Firefox, Safari, Edge.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      description:
        'Interactive Japanese learning platform with Hiragana, Katakana, Kanji, Vocabulary, Thamlet Flashcards, and Shadowing training',
      featureList: [
        'Learn Hiragana and Katakana',
        'Practice Kanji by JLPT level',
        'Build Japanese vocabulary',
        'Thamlet Quizlet-style flashcards',
        'Shadowing audio & video practice',
        'Interactive games and quizzes',
        'Progress tracking',
        '100+ customizable themes',
        'Multiple training modes',
        'Blitz and Gauntlet challenges',
      ],
      author: {
        '@type': 'Organization',
        name: 'PThamSS',
      },
      creator: {
        '@type': 'Organization',
        name: 'PThamSS',
      },
      inLanguage: ['vi', 'en', 'es'],
      availableLanguage: ['Vietnamese', 'English', 'Spanish'],
      isAccessibleForFree: true,
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: 'Student',
      },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://www.pthamnihongo.site/#educational',
      name: 'PThamSS',
      url: 'https://www.pthamnihongo.site',
      description: 'Interactive Japanese language learning platform',
      educationalCredentialAwarded: 'Japanese Language Proficiency',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Japanese Learning Courses',
        itemListElement: [
          {
            '@type': 'Course',
            name: 'Hiragana & Katakana Learning',
            description: 'Master Japanese Hiragana and Katakana syllabaries',
            provider: {
              '@type': 'Organization',
              name: 'PThamSS',
            },
          },
          {
            '@type': 'Course',
            name: 'Kanji Learning by JLPT Level',
            description:
              'Learn essential Kanji characters organized by JLPT levels',
            provider: {
              '@type': 'Organization',
              name: 'PThamSS',
            },
          },
          {
            '@type': 'Course',
            name: 'Japanese Vocabulary Building',
            description: 'Build Japanese vocabulary organized by JLPT levels',
            provider: {
              '@type': 'Organization',
              name: 'PThamSS',
            },
          },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.pthamnihongo.site/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is PThamSS?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PThamSS is a free, aesthetic Japanese learning platform that helps you master Hiragana, Katakana, Kanji, and Vocabulary through interactive games and exercises. It features 100+ customizable themes, progress tracking, and training modes designed to make learning Japanese enjoyable and effective.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is PThamSS completely free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! PThamSS is completely free to use with no hidden costs, subscriptions, or premium features. All learning content, games, themes, and features are available to everyone at no charge.',
          },
        },
        {
          '@type': 'Question',
          name: 'What can I learn on PThamSS?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can learn all fundamental Japanese writing systems: Hiragana (basic, dakuon, yoon), Katakana (basic, dakuon, yoon, foreign sounds), Kanji organized by JLPT levels (N5-N1), and Japanese Vocabulary also organized by JLPT levels with thousands of words and example sentences.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to create an account?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No account is required! PThamSS stores all your progress locally in your browser, so you can start learning immediately without signing up. Your progress and preferences are automatically saved as you use the platform.',
          },
        },
        {
          '@type': 'Question',
          name: 'What are the different training modes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PThamSS offers multiple training modes: Pick Mode (multiple choice recognition), Reverse-Pick (reverse multiple choice), Input Mode (text input practice), Reverse-Input (reverse text input), Blitz Mode (speed tests), and Gauntlet Mode (comprehensive mastery challenges).',
          },
        },
        {
          '@type': 'Question',
          name: 'How does progress tracking work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PThamSS automatically tracks your learning statistics including correct answers, speed, accuracy, and mastery levels for each character or word. All progress is stored locally in your browser and displayed in detailed charts and statistics on the Progress page.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use PThamSS on mobile devices?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! PThamSS is fully responsive and works seamlessly on mobile phones, tablets, and desktop computers. The interface adapts to your screen size for an optimal learning experience on any device.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is PThamSS suitable for JLPT preparation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely! PThamSS organizes Kanji and Vocabulary content by JLPT levels (N5, N4, N3, N2, N1), making it an excellent supplementary tool for JLPT exam preparation. Practice characters and words specific to your target JLPT level.',
          },
        },
      ],
    },
  ],
};
