import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';
import { ethereumAddressRegex } from '@/utils/regex';

export type ImportCustomERC20TokenForm = {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
};

export function useSchema() {
  const { t } = useTranslation();

  const importCustomERC20TokenForm = Joi.object<ImportCustomERC20TokenForm>({
    address: Joi.string()
      .required()
      .pattern(ethereumAddressRegex)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'string.pattern.base': t('schema.importTokenForm.address.string.pattern.base'),
      }),
    symbol: Joi.string()
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
    logoUrl: Joi.string()
      .allow('')
      .optional()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
  });

  return { importCustomERC20TokenForm };
}
