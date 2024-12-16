import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';

export type ResetForm = {
  resetText: string;
};

export function useSchema() {
  const { t } = useTranslation();
  const resetForm = Joi.object<ResetForm>({
    resetText: Joi.string()
      .required()
      .valid('RESET')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'any.only': t('schema.resetForm.reset.any.only'),
      }),
  });

  return { resetForm };
}
