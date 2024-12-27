import { useTranslation } from 'react-i18next';

import type { CosmosChain } from '@/types/chain';
import Joi from '@/utils/joi';
import { getCosmosAddressRegex } from '@/utils/regex';

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

  const regex = getCosmosAddressRegex(chain?.accountPrefix || '', [39, 59]);

  const importCustomCW20TokenForm = Joi.object<ImportCustomCW20TokenForm>({
    address: Joi.string()
      .required()
      .pattern(regex)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.pattern.base': t('schema.importTokenForm.address.string.pattern.base'),
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
