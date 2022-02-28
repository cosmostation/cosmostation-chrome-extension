import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type PasswordForm = {
  password: string;
  repeatPassword: string;
};

export function useSchema() {
  const { t } = useTranslation();
  const passwordForm = Joi.object<PasswordForm>({
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
      }),
    repeatPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.only': t('schema.passwordForm.repeatPassword.any.only'),
      }),
  });

  return { passwordForm };
}
