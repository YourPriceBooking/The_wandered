module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/jsx-runtime',
    'next/core-web-vitals',
    'plugin:storybook/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'simple-import-sort',
    'react-hooks'
  ],
  rules: {
    // Вимкнути правила, які ви не хочете фіксити
    'quotes': 'off',
    'semi': 'off',
    'indent': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'react/self-closing-comp': 'off',
    '@next/next/no-img-element': 'off',
    'simple-import-sort/imports': 'off',
    'simple-import-sort/exports': 'off',
    'no-empty-pattern': 'off',
    'prefer-const': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/naming-convention': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};