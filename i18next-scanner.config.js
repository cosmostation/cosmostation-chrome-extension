const fs = require('fs');

module.exports = {
  input: [
    'src/Popup/**/*.{ts,tsx}',
    // Use ! to filter out files or directories
    '!src/Popup/**/*.spec.{ts,tsx}',
    '!src/Popup/i18n/**',
    '!**/node_modules/**',
  ],
  output: './',
  options: {
    debug: true,
    sort: true,
    func: {
      list: ['t'],
      extensions: ['.ts', '.tsx'],
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.ts', '.tsx'],
      fallbackKey(ns, value) {
        return value;
      },
      acorn: {
        ecmaVersion: 10, // defaults to 10
        sourceType: 'module', // defaults to 'module'
        // Check out https://github.com/acornjs/acorn/tree/master/acorn#interface for additional options
      },
    },
    lngs: ['en', 'ko'],
    ns: ['translation'],
    defaultLng: 'en',
    defaultNs: 'translation',
    defaultValue: '__STRING_NOT_TRANSLATED__',
    resource: {
      loadPath: 'src/Popup/i18n/{{lng}}/{{ns}}.json',
      savePath: 'src/Popup/i18n/{{lng}}/{{ns}}.json',
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
  transform: function customTransform(file, enc, done) {
    const { parser } = this;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    parser.parseFuncFromString(content, { list: ['i18next._', 'i18next.__'] }, (key, options) => {
      parser.set(key, { ...options, nsSeparator: false, keySeparator: false });
      count += 1;
    });

    if (count > 0) {
      console.log(`i18next-scanner: count=${count}, file=${JSON.stringify(file.relative)}`);
    }

    done();
  },
};
