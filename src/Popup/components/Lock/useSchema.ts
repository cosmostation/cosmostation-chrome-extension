import Joi from 'joi';

import { useTranslation } from '~/Popup/hooks/useTranslation';

export type PasswordForm = {
  password: string;
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
  });

  return { passwordForm };
}
