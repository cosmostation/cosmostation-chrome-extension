import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type HDPathForm = {
  addressIndex: number;
};

export function useSchema() {
  const { t } = useTranslation();
  const hdPathForm = Joi.object<HDPathForm>({
    addressIndex: Joi.number()
      .required()
      .min(0)
      .max(200000)
      .messages({
        'any.required': t('schema.common.any.required'),
        'number.base': t('schema.common.number.base'),
        'number.min': t('schema.common.number.min'),
        'number.max': t('schema.common.number.max'),
      }),
  });

  return { hdPathForm };
}
