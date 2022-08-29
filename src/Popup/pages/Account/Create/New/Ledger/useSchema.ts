import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type LedgerForm = {
  name: string;
};

export function useSchema() {
  const { t } = useTranslation();
  const ledgerForm = Joi.object<LedgerForm>({
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
  });

  return { ledgerForm };
}
