import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';

export type NameForm = {
  name: string;
};

export function useSchema() {
  const { t } = useTranslation();
  const nameForm = Joi.object<NameForm>({
    name: Joi.string()
      .trim()
      .required()
      .min(1)
      .max(20)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'string.max': t('schema.common.string.max'),
      }),
  });

  return { nameForm };
}
