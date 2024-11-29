import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';

export type PrivateKeyForm = {
  privateKey: string;
};

export function useSchema() {
  const { t } = useTranslation();
  const privateKeyForm = Joi.object<PrivateKeyForm>({
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
