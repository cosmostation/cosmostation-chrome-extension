/* eslint-disable no-undef */

module.exports = {
  input: [
    'src/pages/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    // Use ! to filter out files or directories
    '!src/**/*.spec.{ts,tsx}',
    '!src/lang/**',
    '!src/proto/**',
    '!**/node_modules/**',
  ],
  output: './',
  options: {
    compatibilityJSON: 'v3',
    debug: true,
    func: {
      list: ['t'],
      extensions: ['.ts', '.tsx'],
    },
    lngs: ['en', 'ko'],
    ns: ['translation'],
    defaultLng: 'en',
    defaultNs: 'translation',
    defaultValue: '__STRING_NOT_TRANSLATED__',
    resource: {
      loadPath: 'src/lang/{{ns}}/{{lng}}.json',
      savePath: 'src/lang/{{ns}}/{{lng}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    nsSeparator: ':', // namespace separator
    keySeparator: '.', // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
};
