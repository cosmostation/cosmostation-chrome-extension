import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';

export type NewAccountForm = {
  accountName: string;
  hdPathIndex: string;
};

export function useSchema() {
  const { t } = useTranslation();
  const newAccountForm = Joi.object<NewAccountForm>({
    accountName: Joi.string()
      .required()
      .trim()
      .min(1)
      .max(20)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'string.max': t('schema.common.string.max'),
      }),
    hdPathIndex: Joi.string()
      .required()
      .pattern(/^[0-9]$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.pattern.base': t('schema.common.string.pattern.invalidRange'),
      }),
  });

  return { newAccountForm };
}
