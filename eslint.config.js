import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // 1. Kế thừa các quy tắc chuẩn của ESLint JavaScript
  js.configs.recommended,

  // 2. Cấu hình chính cho dự án Express Backend
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^(req|res|next)$' }],
      'no-console': 'off',
    },
  },

  // 3. Tắt các quy tắc xung đột với Prettier (phải đặt ở cuối)
  prettierConfig,

  // 4. Bỏ qua các thư mục không cần kiểm tra
  {
    ignores: ['node_modules/', 'dist/', 'coverage/', 'logs/', 'drizzle/'],
  },
];
