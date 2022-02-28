import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type ChangePasswordForm = {
  password: string;
  newPassword: string;
  repeatNewPassword: string;
};

type useSchemaProps = {
  encryptedPassword: string;
};

export function useSchema({ encryptedPassword }: useSchemaProps) {
  const { t } = useTranslation();
  const changePasswordForm = Joi.object<ChangePasswordForm>({
    password: Joi.string()
      .required()
      .min(8)
      .valid(encryptedPassword)
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

  return { changePasswordForm };
}
