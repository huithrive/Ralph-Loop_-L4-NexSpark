module.exports = {
  env: {
    browser: false,
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': 'warn',
    'no-console': 'off', // Allow console.log for server logging
    'no-undef': 'error',
  },
  ignorePatterns: ['node_modules/', 'dist/', '*.test.js'],
};