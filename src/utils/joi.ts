import * as bip39 from 'bip39';
import type { Root } from 'joi';
import BaseJoi from 'joi';

import { isValidPrivateKey } from './crypto/privateKey';

// interface StringSchema extends BaseStringSchema {
// //   mnemonic(substring:string): this;
// //   privateKey(substring:string): this;
// }

// interface Joi extends Root {
//   string(): StringSchema;
// }

type Helper = {
  error: (key: string) => void;
};

const customJoi: Root = BaseJoi.extend((joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    mnemonic: '{{#label}} is invalid',
    privateKey: '{{#label}} is invalid',
  },
  rules: {
    mnemonic: {
      validate(value: string, helpers: Helper) {
        if (!bip39.validateMnemonic(value)) {
          return helpers.error('mnemonic');
        }
        return value;
      },
    },
    privateKey: {
      validate(value: string, helpers: Helper) {
        const pk = value.startsWith('0x') ? value.substring(2) : value;
        const buffer = Buffer.from(pk, 'hex');
        if (!isValidPrivateKey(buffer)) {
          return helpers.error('privateKey');
        }
        return value;
      },
    },
  },
}));

export default customJoi;
