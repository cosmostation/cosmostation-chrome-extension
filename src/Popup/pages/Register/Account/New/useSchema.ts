import { ACCOUNT_COIN_TYPE } from '~/constants/chromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import type { AccountCoinType } from '~/types/chromeStorage';

export type NewMnemonicForm = {
  coinType: AccountCoinType;
  name: string;
  account: number;
  change: number;
  addressIndex: number;
};

type useSchemaProps = {
  name: string[];
};

export function useSchema({ name }: useSchemaProps) {
  const { t } = useTranslation();

  const accountCoinType = Object.values(ACCOUNT_COIN_TYPE);
  const newMnemonicForm = Joi.object<NewMnemonicForm>({
    name: Joi.string()
      .required()
      .invalid(...name)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.invalid': t('schema.mnemonicForm.name.any.invlid'),
      }),
    coinType: Joi.string().valid(...accountCoinType),
    account: Joi.number()
      .required()
      .min(0)
      .max(999999)
      .messages({
        'number.base': t('schema.common.number.base'),
        'number.min': t('schema.common.number.min'),
        'number.max': t('schema.common.number.max'),
      }),
    change: Joi.number()
      .required()
      .min(0)
      .max(999999)
      .messages({
        'number.base': t('schema.common.number.base'),
        'number.min': t('schema.common.number.min'),
        'number.max': t('schema.common.number.max'),
      }),
    addressIndex: Joi.number()
      .required()
      .min(0)
      .max(999999)
      .messages({
        'number.base': t('schema.common.number.base'),
        'number.min': t('schema.common.number.min'),
        'number.max': t('schema.common.number.max'),
      }),
  });

  return { newMnemonicForm };
}
