import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type PasswordForm = {
  password: string;
};

type useSchemaProps = {
  encryptedPassword: string;
};

export function useSchema({ encryptedPassword }: useSchemaProps) {
  const { t } = useTranslation();
  const passwordForm = Joi.object<PasswordForm>({
    password: Joi.string()
      .required()
      .min(8)
      .valid(encryptedPassword)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'any.only': t('schema.passwordForm.password.any.only'),
      }),
  });

  return { passwordForm };
}
