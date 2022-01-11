import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type MnemonicForm = {
  mnemonic: string;
  name: string;
  addressIndex: number;
};

type useSchemaProps = {
  name: string[];
};

export function useSchema({ name }: useSchemaProps) {
  const { t } = useTranslation();

  const mnemonicForm = Joi.object<MnemonicForm>({
    mnemonic: Joi.string()
      .required()
      .mnemonic()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        mnemonic: t('schema.mnemonicForm.mnemonic'),
      }),
    name: Joi.string()
      .required()
      .invalid(...name)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.invalid': t('schema.mnemonicForm.name.any.invlid'),
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

  return { mnemonicForm };
}
