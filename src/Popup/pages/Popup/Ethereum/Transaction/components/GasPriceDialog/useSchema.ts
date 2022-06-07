import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type GasPriceForm = {
  gasPrice: number;
};

export function useSchema() {
  const { t } = useTranslation();
  const gasPriceForm = Joi.object<GasPriceForm>({
    gasPrice: Joi.number()
      .required()
      .greater(0)
      .messages({
        'any.required': t('schema.common.any.required'),
        'number.base': t('schema.common.number.base'),
        'number.greater': t('schema.common.number.greater'),
      }),
  });

  return { gasPriceForm };
}
