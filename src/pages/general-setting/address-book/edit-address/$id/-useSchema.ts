import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';

export type AddressBookForm = {
  label: string;
  address: string;
  memo?: string;
};

type useSchemaProps = {
  checkIsValidAddress: (address: string) => boolean;
};

export function useSchema({ checkIsValidAddress }: useSchemaProps) {
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
      .custom((value, helpers) => {
        if (!checkIsValidAddress(value)) {
          return helpers.error('string.pattern.base', { value });
        }
        return value;
      })
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.pattern.base': t('schema.addressBookForm.address.string.pattern.base'),
      }),

    memo: Joi.string()
      .max(80)
      .trim()
      .allow('')
      .optional()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.max': t('schema.common.string.max'),
      }),
  });

  return { addressBookForm };
}
