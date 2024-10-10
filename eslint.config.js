import pluginImport from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginJs from '@eslint/js';

export default [
  { ignores: ['**/dist/', '**/dist-dev/'] },
  { files: ['**/src/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: { react: { version: 'detect' } },
  },
  pluginReact.configs.flat['jsx-runtime'],
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: pluginReactHooks.configs.recommended.rules,
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    plugins: {
      'simple-import-sort': pluginSimpleImportSort,
      import: pluginImport,
    },
    rules: {
      // 유사한 항목을 그룹으로 묶어서 정렬합니다.
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports
            ['^\\u0000'],
            // Packages. 'react' related packages come first.
            ['^react', '^\\w', '^@'],
            // Aliases imports.
            ['^~'],
            // Relative imports. Put same-folder imports first and parent imports last.
            ['^\\.', '^\\.\\.'],
            // SVG icons
            ['^.+\\.svg$'],
            // json files
            ['^.+\\.json$'],
            // Style imports.
            ['^.+\\.scss$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      // import 문은 문서 상단에 위치합니다.
      'import/first': 'error',

      // import 문 아래에 빈 줄을 삽입합니다.
      'import/newline-after-import': 'error',

      // 중복된 import를 허용하지 않습니다.
      'import/no-duplicates': 'error',

      // import 플러그인으로도 ordering을 강제할 수 있지만, order group 지정이 더 간편한 simple-import-sort 플러그인을 대신 사용합니다.
      'import/order': 'off',

      // 한 파일에 하나의 export만 있더라도 여러 개로 늘어날 가능성을 고려하여 default export를 하지 않는 경우가 훨씬 많습니다.
      'import/prefer-default-export': 'off',
    },
  },
];
