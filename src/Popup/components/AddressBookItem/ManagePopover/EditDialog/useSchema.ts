import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';

export type AddressBookForm = {
  label: string;
  address: string;
  memo?: string;
};

export function useSchema() {
  const { t } = useTranslation();
  const addressBookForm = Joi.object<AddressBookForm>({
    label: Joi.string()
      .required()
      .trim()
      .min(1)
      .max(30)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
        'string.max': t('schema.common.string.max'),
      }),

    address: Joi.string()
      .required()
      .trim()
      .min(1)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
      }),

    memo: Joi.string()
      .optional()
      .trim()
      .max(80)
      .allow('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.max': t('schema.common.string.max'),
      }),
  });

  return { addressBookForm };
}
