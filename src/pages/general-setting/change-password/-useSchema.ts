import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';

export type ChangePasswordForm = {
  previousPassword: string;
  newPassword: string;
  repeatNewPassword: string;
};

type UseSchemaProps = {
  comparisonPasswordHash: string;
};

export function useSchema({ comparisonPasswordHash }: UseSchemaProps) {
  const { t } = useTranslation();
  const newPasswordForm = Joi.object<ChangePasswordForm>({
    previousPassword: Joi.string()
      .required()
      .min(8)
      .valid(comparisonPasswordHash)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'any.only': t('schema.changePasswordForm.password.any.only'),
      }),
    newPassword: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
      }),
    repeatNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.only': t('schema.changePasswordForm.repeatPassword.any.only'),
      }),
  });

  return { newPasswordForm };
}
