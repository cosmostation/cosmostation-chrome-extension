import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';

export type PasswordForm = {
  password: string;
};

type useSchemaProps = {
  comparisonPasswordHash: string;
};

export function useSchema({ comparisonPasswordHash }: useSchemaProps) {
  const { t } = useTranslation();
  const passwordForm = Joi.object<PasswordForm>({
    password: Joi.string()
      .required()
      .min(8)
      .valid(comparisonPasswordHash)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'any.only': t('schema.passwordForm.password.any.only'),
      }),
  });

  return { passwordForm };
}
