import * as bip39 from 'bip39';
import type { Root, StringSchema as BaseStringSchema } from 'joi';
import BaseJoi from 'joi';

import { isValidPrivateKey } from './crypto/privateKey';

interface StringSchema<TSchema = string> extends BaseStringSchema<TSchema> {
  mnemonic(): this;
  privateKey(): this;
}

interface Joi extends Root {
  string<TSchema = string>(): StringSchema<TSchema>;
}

type Helper = {
  error: (key: string) => void;
};

const customJoi: Joi = BaseJoi.extend((joi) => ({
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
