import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';

export type HdPathIndexForm = {
  hdPathIndex: string;
};

export function useSchema() {
  const { t } = useTranslation();

  const restoreAccountForm = Joi.object<HdPathIndexForm>({
    hdPathIndex: Joi.string()
      .required()
      .pattern(/^[0-9]$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.pattern.base': t('schema.common.string.pattern.invalidRange'),
      }),
  });

  return { restoreAccountForm };
}
