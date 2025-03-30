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
]
