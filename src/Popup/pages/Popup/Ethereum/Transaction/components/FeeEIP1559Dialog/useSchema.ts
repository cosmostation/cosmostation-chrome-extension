import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type FeeEIP1559Form = {
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
};

export function useSchema() {
  const { t } = useTranslation();
  const feeEIP1559Form = Joi.object<FeeEIP1559Form>({
    maxFeePerGas: Joi.number()
      .required()
      .greater(0)
      .messages({
        'any.required': t('schema.common.any.required'),
        'number.base': t('schema.common.number.base'),
        'number.greater': t('schema.common.number.greater'),
      }),
    maxPriorityFeePerGas: Joi.number()
      .less(Joi.ref('maxFeePerGas'))
      .required()
      .greater(0)
      .messages({
        'any.required': t('schema.common.any.required'),
        'number.base': t('schema.common.number.base'),
        'number.greater': t('schema.common.number.greater'),
      }),
  });

  return { feeEIP1559Form };
}
