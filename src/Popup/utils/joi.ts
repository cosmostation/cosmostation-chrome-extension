import * as bip39 from 'bip39';
import type { Root, StringSchema as BaseStringSchema } from 'joi';
import BaseJoi from 'joi';

import { isPrivate } from '~/Popup/utils/crypto';

interface StringSchema extends BaseStringSchema {
  mnemonic(): this;
  privateKey(): this;
}

interface Joi extends Root {
  string(): StringSchema;
}

type Helper = {
  error: (key: string) => void;
};

const customJoi = BaseJoi.extend((joi) => ({
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
        if (!isPrivate(buffer)) {
          return helpers.error('privateKey');
        }
        return value;
      },
    },
  },
})) as Joi;

export default customJoi;
