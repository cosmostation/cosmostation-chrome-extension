import { ACCOUNT_COIN_TYPE } from '~/constants/chromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import type { AccountCoinType } from '~/types/chromeStorage';

export type MnemonicForm = {
  mnemonic: string;
  coinType: AccountCoinType;
  name: string;
};

type useSchemaProps = {
  name: string[];
};

export function useSchema({ name }: useSchemaProps) {
  const { t } = useTranslation();

  const accountCoinType = Object.values(ACCOUNT_COIN_TYPE);
  const mnemonicForm = Joi.object<MnemonicForm>({
    mnemonic: Joi.string()
      .required()
      .mnemonic()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        mnemonic: t('schema.mnemonicForm.mnemonic'),
      }),
    coinType: Joi.string().valid(...accountCoinType),
    name: Joi.string()
      .required()
      .invalid(...name)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.invalid': t('schema.mnemonicForm.name.any.invlid'),
      }),
  });

  return { mnemonicForm };
}
