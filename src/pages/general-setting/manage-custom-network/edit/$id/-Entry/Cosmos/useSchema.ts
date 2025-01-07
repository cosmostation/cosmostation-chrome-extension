import { useTranslation } from 'react-i18next';

import Joi from '@/utils/joi';

export type AddChainForm = {
  ''?: string;
  chainName: string;
  mainAssetDenom: string;
  accountPrefix: string;
  lcdUrl: string;
  symbol: string;
  chainImage?: string;
  isCosmwasm?: boolean;
  isEvm?: boolean;
  explorerURL?: string;
  tokenImageURL?: string;
  decimals?: number;
  coinType?: string;
  gasRateLow?: string;
  gasRateAverage?: string;
  gasRateHigh?: string;
  defaultGasLimit?: string;
  coinGeckoId?: string;
};

export function useSchema() {
  const { t } = useTranslation();

  const addChainForm = Joi.object<AddChainForm>({
    chainName: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    chainImage: Joi.string()
      .optional()
      .empty('')
      .messages({
        'string.base': t('schema.common.string.base'),
      }),

    mainAssetDenom: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    accountPrefix: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    lcdUrl: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    explorerURL: Joi.string()
      .optional()
      .empty('')
      .messages({
        'string.base': t('schema.common.string.base'),
      }),
    tokenImageURL: Joi.string()
      .optional()
      .empty('')
      .messages({
        'string.base': t('schema.common.string.base'),
      }),
    symbol: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    decimals: Joi.number()
      .optional()
      .empty('')
      .messages({
        'number.base': t('schema.common.number.base'),
      }),
    coinType: Joi.string()
      .optional()
      .empty('')
      .pattern(/^[0-9]+'?$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.pattern.base': t('schema.addChainForm.coinType.any.invalid'),
      }),
    coinGeckoId: Joi.string()
      .optional()
      .empty('')
      .messages({
        'string.base': t('schema.common.string.base'),
      }),
    gasRateLow: Joi.string()
      .optional()
      .empty('')
      .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.pattern.base': t('schema.addChainForm.decimal.base'),
      }),
    gasRateAverage: Joi.string()
      .optional()
      .empty('')
      .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.pattern.base': t('schema.addChainForm.decimal.base'),
      }),
    gasRateHigh: Joi.string()
      .optional()
      .empty('')
      .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.pattern.base': t('schema.addChainForm.decimal.base'),
      }),
    defaultGasLimit: Joi.string()
      .optional()
      .empty('')
      .pattern(/^[0-9]+$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.pattern.base': t('schema.common.number.base'),
      }),
  })
    .and('gasRateLow', 'gasRateAverage', 'gasRateHigh')
    .messages({
      'object.and': t('schema.addChainForm.gasRate.object.and'),
    });
  return { addChainForm };
}
