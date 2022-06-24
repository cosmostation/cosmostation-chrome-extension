import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import { ethereumAddressRegex } from '~/Popup/utils/regex';

export type ImportTokenForm = {
  address: string;
  displayDenom: string;
  decimals: number;
};

export function useSchema() {
  const { t } = useTranslation();

  const importTokenForm = Joi.object<ImportTokenForm>({
    address: Joi.string()
      .required()
      .pattern(ethereumAddressRegex)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'string.pattern.base': t('schema.importTokenForm.address.string.pattern.base'),
      }),
    displayDenom: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
      }),
    decimals: Joi.number()
      .min(0)
      .required()
      .messages({
        'any.required': t('schema.common.any.required'),
        'number.base': t('schema.common.number.base'),
        'number.min': t('schema.common.number.min'),
      }),
  });

  return { importTokenForm };
}
