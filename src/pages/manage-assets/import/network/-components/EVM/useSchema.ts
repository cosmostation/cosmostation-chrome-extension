import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';
import { hexOrDecRegex } from '@/utils/regex';

export type AddNetworkForm = {
  chainId: string;
  networkName: string;
  rpcURL: string;
  symbol: string;
  coinGeckoId?: string;
  explorerURL?: string;
  chainImage?: string;
  tokenImageURL?: string;
};

export function useSchema() {
  const { t } = useTranslation();

  const addNetworkForm = Joi.object<AddNetworkForm>({
    chainId: Joi.string()
      .required()
      .pattern(hexOrDecRegex)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.pattern.base': t('schema.addNetworkForm.address.string.pattern.base'),
      }),
    networkName: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    rpcURL: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    symbol: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    coinGeckoId: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    explorerURL: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    tokenImageURL: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    chainImage: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
  });

  return { addNetworkForm };
}
