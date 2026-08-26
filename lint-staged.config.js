const lintStagedConfig = {
  // TypeScript and JavaScript files: run ESLint with auto-fix (suppress ignored warnings for sub-apps)
  '*.{ts,tsx,js,jsx}': ['eslint --fix --max-warnings=0 --no-warn-ignored'],

  // All supported files: run Prettier formatting
  '*.{ts,tsx,js,jsx,json,css,md,mdx,yml,yaml}': ['prettier --write'],

  // TypeScript type checking on root project
  '*.{ts,tsx}': () => 'tsc --noEmit',
};

export default lintStagedConfig;
