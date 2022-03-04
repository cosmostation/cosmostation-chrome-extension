import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type MnemonicForm = {
  name: string;
  mnemonic: string;
};

export function useSchema() {
  const { t } = useTranslation();
  const mnemonicForm = Joi.object<MnemonicForm>({
    name: Joi.string()
      .required()
      .min(1)
      .max(20)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'string.max': t('schema.common.string.max'),
      }),
    mnemonic: Joi.string()
      .required()
      .mnemonic()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        mnemonic: t('schema.mnemonicForm.mnemonic'),
      }),
  });

  return { mnemonicForm };
}
