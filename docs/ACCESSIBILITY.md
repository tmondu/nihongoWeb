# Accessibility Guide

This document outlines PThamSS's accessibility (a11y) standards, testing procedures, and best practices.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Accessibility Standards](#accessibility-standards)
- [Key Requirements](#key-requirements)
- [Testing Procedures](#testing-procedures)
- [Common Issues](#common-issues)
- [Tools](#tools)
- [Resources](#resources)

---

## Overview

PThamSS is committed to making the application accessible to all users, including those with disabilities. We aim to comply with:

- **WCAG 2.1 Level AA** as our target standard
- **Section 508** (for US federal agencies)
- **EN 301 549** (European accessibility standard)

---

## Accessibility Standards

### WCAG 2.1 Guidelines

| Principle          | Description                                                | Level |
| ------------------ | ---------------------------------------------------------- | ----- |
| **Perceivable**    | Information must be presentable in ways users can perceive | A, AA |
| **Operable**       | UI components must be operable                             | A, AA |
| **Understandable** | Information and operation must be understandable           | A, AA |
| **Robust**         | Content must be robust enough for assistive technologies   | A, AA |

### Priority Matrix

| Priority | Impact   | Description                          |
| -------- | -------- | ------------------------------------ |
| P0       | Critical | Must fix - blocks core functionality |
| P1       | High     | Should fix - significant barrier     |
| P2       | Medium   | Should fix - minor barrier           |
| P3       | Low      | Could fix - enhancement              |

---

## Key Requirements

### 1. Keyboard Navigation

All functionality must be keyboard accessible:

```typescript
// ✅ Correct - has keyboard support
<button onKeyDown={handleKeyDown} tabIndex={0}>
  Submit
</button>

// ❌ Wrong - no keyboard access
<div onClick={handleClick}>
  Submit
</div>
```

**Requirements**:

- All interactive elements have `tabIndex` (0 or greater)
- Focus order follows visual layout
- Visible focus indicator on all interactive elements
- Skip links for main content

### 2. ARIA Labels

Provide accessible names for assistive technology:

```typescript
// ✅ Correct - with ARIA label
<button aria-label="Close dialog">
  <XIcon />
</button>

// ✅ Correct - with visible text
<button aria-label="Close">
  <XIcon /> Close
</button>

// ❌ Wrong - no accessible name
<button><XIcon /></button>
```

### 3. Form Labels

All form inputs must have labels:

```typescript
// ✅ Correct - explicit label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Correct - wrapped label
<label>
  Email
  <input type="email" />
</label>

// ✅ Correct - aria-label
<input type="email" aria-label="Email address" />

// ❌ Wrong - placeholder is not a label
<input type="email" placeholder="Enter email" />
```

### 4. Color Contrast

Text must have sufficient color contrast:

| Text Size       | Minimum Ratio |
| --------------- | ------------- |
| Normal (< 18pt) | 4.5:1         |
| Large (≥ 18pt)  | 3:1           |
| UI Components   | 3:1           |

```typescript
// ✅ Correct - sufficient contrast
<div style={{ color: '#1a1a1a', background: '#ffffff' }}>
  Readable text
</div>

// ❌ Wrong - insufficient contrast
<div style={{ color: '#999999', background: '#ffffff' }}>
  Hard to read
</div>
```

### 5. Focus Management

Manage focus appropriately for dynamic content:

```typescript
// ✅ Correct - focus moved to new content
function openModal() {
  setIsOpen(true);
  setTimeout(() => {
    document.getElementById('modal-title')?.focus();
  }, 0);
}

// ✅ Correct - focus returned on close
function closeModal() {
  const trigger = document.getElementById('open-modal');
  setIsOpen(false);
  trigger?.focus();
}
```

### 6. Screen Reader Support

Provide context for screen readers:

```typescript
// ✅ Correct - with live region for updates
<div role="status" aria-live="polite">
  Game saved successfully
</div>

// ✅ Correct - with region label
<section aria-labelledby="game-title">
  <h2 id="game-title">Current Game</h2>
  {/* content */}
</section>
```

---

## Testing Procedures

### Automated Testing

Run accessibility tests with:

```bash
# Using axe-core
npm run test:a11y

# Using storybook a11y addon
npm run storybook
# Visit http://localhost:6006
```

### Manual Testing Checklist

#### Keyboard Testing

- [ ] Tab through all interactive elements
- [ ] Tab order matches visual layout
- [ ] All focus indicators are visible
- [ ] No keyboard traps
- [ ] Escape key closes modals/dropdowns
- [ ] Enter/Space activates buttons

#### Screen Reader Testing

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Dynamic content is announced
- [ ] Error messages are described
- [ ] Tables have headers

#### Visual Testing

- [ ] Text contrast meets requirements
- [ ] Content reflows at 320px width
- [ ] No loss of content at 200% zoom
- [ ] No horizontal scrolling at 100% zoom

### Browser Testing

Test in:

- Chrome + NVDA
- Firefox + NVDA
- Safari + VoiceOver
- Edge + Narrator

---

## Common Issues

### 1. Missing Alt Text

```typescript
// ❌ Wrong
<img src="/game/screenshot.png" />

// ✅ Correct
<img src="/game/screenshot.png" alt="Kana game showing hiragana practice" />

// ✅ Correct - decorative
<img src="/decorative.png" alt="" />
```

### 2. Empty Links/Buttons

```typescript
// ❌ Wrong
<a href="#"><Icon /></a>

// ✅ Correct
<a href="/home" aria-label="Go to home">
  <HomeIcon />
</a>
```

### 3. Missing Form Labels

```typescript
// ❌ Wrong
<input type="text" placeholder="Search..." />

// ✅ Correct
<label htmlFor="search" className="sr-only">Search</label>
<input id="search" type="text" placeholder="Search..." />
```

### 4. Insufficient Color Contrast

```typescript
// ❌ Wrong - fails contrast
<span style={{ color: '#888', background: '#fff' }}>Text</span>

// ✅ Correct - passes AA
<span style={{ color: '#666', background: '#fff' }}>Text</span>
```

### 5. Missing Headings Structure

```typescript
// ❌ Wrong - skipped heading level
<h1>Page Title</h1>
<h3>Section</h3>  // Skipped h2!

// ✅ Correct - sequential headings
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

---

## Tools

### Development Tools

| Tool                                                                           | Purpose                            |
| ------------------------------------------------------------------------------ | ---------------------------------- |
| [axe DevTools](https://www.deque.com/axe/devtools/)                            | Browser extension for a11y testing |
| [WAVE](https://wave.webaim.org/)                                               | Web accessibility evaluator        |
| [Lighthouse](https://developers.google.com/web/tools/lighthouse)               | Automated auditing                 |
| [ESLint plugin jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) | Linting for a11y                   |

### ESLint Configuration

Add to `.eslintrc.json`:

```json
{
  "extends": ["plugin:jsx-a11y/recommended"],
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "error",
    "jsx-a11y/aria-props": "warn",
    "jsx-a11y/label-has-associated-control": "error"
  }
}
```

---

## Resources

### Guidelines

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)

### Testing

- [axe-core](https://www.deque.com/axe/)
- [Pa11y](https://pa11y.org/)
- [Accessibility Insights](https://accessibilityinsights.io/)

### Learning

- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## Related Documentation

- [UI Design](./UI_DESIGN.md)
- [Architecture](./ARCHITECTURE.md)

---

**Last Updated**: January 2025
