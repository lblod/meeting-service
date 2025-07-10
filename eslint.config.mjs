import globals from 'globals';
import pluginJs from '@eslint/js';
/** @import { Linter } from 'eslint' */
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/** @type {Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      semi: ['error', 'always'],
      'linebreak-style': ['error', 'unix'],
    },
  },
];
