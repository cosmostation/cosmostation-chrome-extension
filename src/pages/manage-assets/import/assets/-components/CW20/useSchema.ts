import { useTranslation } from 'react-i18next';
import type { CustomHelpers } from 'joi';

import type { CosmosChain } from '@/types/chain';
import { isValidCosmosAddress } from '@/utils/cosmos/address';
import Joi from '@/utils/joi';

export type ImportCustomCW20TokenForm = {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
};

type UseSchemaProps = {
  chain?: CosmosChain;
};

export function useSchema({ chain }: UseSchemaProps) {
  const { t } = useTranslation();

  const cosmosAddressValidator = (value: string, helpers: CustomHelpers) => {
    if (!isValidCosmosAddress(value, chain?.accountPrefix || '')) {
      return helpers.error('any.invalid');
    }
    return value;
  };

  const importCustomCW20TokenForm = Joi.object<ImportCustomCW20TokenForm>({
    address: Joi.string()
      .required()
      .custom(cosmosAddressValidator, 'cosmos contract address validation')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.invalid': t('schema.importTokenForm.address.string.pattern.base'),
      }),
    symbol: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.min': t('schema.common.string.min'),
      }),
    decimals: Joi.number()
      .min(0)
      .required()
      .messages({
        'any.required': t('schema.common.any.required'),
        'number.base': t('schema.common.number.base'),
        'number.min': t('schema.common.number.min'),
      }),
    logoUrl: Joi.string()
      .allow('')
      .optional()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
  });

  return { importCustomCW20TokenForm };
}
