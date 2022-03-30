import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type RestoreForm = {
  restoreString: string;
  password: string;
  repeatPassword: string;
};

type useSchemaProps = {
  encryptedRestoreString: string[];
};

export function useSchema({ encryptedRestoreString }: useSchemaProps) {
  const { t } = useTranslation();
  const restoreForm = Joi.object<RestoreForm>({
    restoreString: Joi.string()
      .required()
      .valid(...encryptedRestoreString)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.only': t('schema.restoreForm.restoreString.any.only'),
      }),
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
        'any.only': t('schema.restoreForm.repeatPassword.any.only'),
      }),
  });

  return { restoreForm };
}
