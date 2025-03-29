import baseConfig from '@mcous/eslint-config'

export default [
  ...baseConfig,
  {
    ignores: ['dist'],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['tests/**/*'],
    rules: {
      'no-empty-pattern': 'off',
    },
  },
  {
    files: ['action.js'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      'no-undef': 'off',
      'unicorn/prefer-module': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
]
