/* eslint-disable no-undef */

// const typescriptTransform = require('i18next-scanner-typescript');
// const fs = require('fs');

module.exports = {
  input: [
    'src/pages/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    // Use ! to filter out files or directories
    '!src/**/*.spec.{ts,tsx}',
    '!src/lang/**',
    '!**/node_modules/**',
  ],
  output: './',
  options: {
    compatibilityJSON: 'v3',
    debug: true,
    func: {
      list: ['t'],
      // extensions: ['.js', '.jsx'],
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
        ecmaVersion: 2020,
        sourceType: 'module', // defaults to 'module'
        // Check out https://github.com/acornjs/acorn/tree/master/acorn#interface for additional options
      },
    },
    lngs: ['en'],
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
  // transform: typescriptTransform(
  //   // options
  //   {
  //     // default value for extensions
  //     extensions: ['.ts', '.tsx'],
  //     output: 'src/lang/{{ns}}/{{lng}}.json',
  //   },
  // ),
  // transform: function customTransform(file, enc, done) {
  //   const { parser } = this;
  //   const content = fs.readFileSync(file.path, enc);
  //   let count = 0;

  //   parser.parseFuncFromString(content, { list: ['i18next._', 'i18next.__'] }, (key, options) => {
  //     parser.set(key, { ...options, nsSeparator: false, keySeparator: false });
  //     count += 1;
  //   });

  //   if (count > 0) {
  //     console.log(`i18next-scanner: count=${count}, file=${JSON.stringify(file.relative)}`);
  //   }

  //   done();
  // },
};
