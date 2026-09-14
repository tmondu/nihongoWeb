import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PitchAccentText from '../PitchAccentText';

describe('PitchAccentText', () => {
  it('renders plain kana when no accent is provided', () => {
    render(<PitchAccentText kana='あさって' />);
    expect(screen.getByText('あさって')).toBeDefined();
  });

  it('renders pitch accent with matching tokenizedKana', () => {
    const { container } = render(
      <PitchAccentText
        kana='うえ'
        accent='LH-H'
        tokenizedKana={[
          { value: 'う', type: 'L' },
          { value: 'え', type: 'H' },
        ]}
      />,
    );
    expect(container.textContent).toContain('うえ');
    expect(container.textContent).not.toContain('かみ');
  });

  it('safely discards mismatched tokenizedKana and renders the actual kana', () => {
    const { container } = render(
      <PitchAccentText
        kana='かみ'
        accent='LH-H'
        tokenizedKana={[
          { value: 'う', type: 'L' },
          { value: 'え', type: 'H' },
        ]}
      />,
    );
    // MUST NOT render 'うえ'!
    expect(container.textContent).not.toContain('うえ');
    // MUST render 'かみ'!
    expect(container.textContent).toContain('かみ');
  });
});
