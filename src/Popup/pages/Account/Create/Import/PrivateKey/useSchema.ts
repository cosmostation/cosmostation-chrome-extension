import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type PrivateKeyForm = {
  name: string;
  privateKey: string;
};

export function useSchema() {
  const { t } = useTranslation();
  const privateKeyForm = Joi.object<PrivateKeyForm>({
    name: Joi.string()
      .required()
      .min(1)
      .max(20)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'string.max': t('schema.common.string.max'),
      }),
    privateKey: Joi.string()
      .required()
      .privateKey()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        privateKey: t('schema.privateKeyForm.privateKey'),
      }),
  });

  return { privateKeyForm };
}
