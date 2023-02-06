import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type GasForm = {
  gas: number;
};

export function useSchema() {
  const { t } = useTranslation();
  const gasForm = Joi.object<GasForm>({
    gas: Joi.number()
      .required()
      .min(1)
      .messages({
        'any.required': t('schema.common.any.required'),
        'number.base': t('schema.common.number.base'),
        'number.min': t('schema.common.number.min'),
      }),
  });

  return { gasForm };
}
