import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import { hexOrDecRegex } from '~/Popup/utils/regex';
import type { EthereumNetwork } from '~/types/chain';

export type AddNetworkForm = Pick<
  EthereumNetwork,
  'chainId' | 'networkName' | 'rpcURL' | 'displayDenom' | 'explorerURL' | 'tokenImageURL' | 'imageURL' | 'coinGeckoId'
>;

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
    displayDenom: Joi.string()
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
    imageURL: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
  });

  return { addNetworkForm };
}
