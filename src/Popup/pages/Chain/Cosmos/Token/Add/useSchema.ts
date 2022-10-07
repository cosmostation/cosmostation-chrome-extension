import { COSMOS_CHAINS } from '~/constants/chain';
import { COSMOS_TYPE } from '~/constants/cosmos';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import type { GasRate } from '~/types/chain';
import type { CosAddChain } from '~/types/message/cosmos';

// export type AddChainForm = Pick<CosmosChain, 'chainId' | 'chainName' | 'restURL' |'baseDenom' |'coinType' | 'displayDenom' | 'explorerURL' | 'imageURL' | 'coinGeckoId'>;

export function useSchema() {
  const { t } = useTranslation();

  const cosmosType = Object.values(COSMOS_TYPE);
  const officialCosmosLowercaseChainIds = COSMOS_CHAINS.map((item) => item.chainId.toLowerCase());

  const addChainForm = Joi.object<CosAddChain['params']>({
    type: Joi.string()
      .valid(...cosmosType)
      .default(''),
    chainId: Joi.string()
      .lowercase()
      .required()
      .invalid(...officialCosmosLowercaseChainIds),
    chainName: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    restURL: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    displayDenom: Joi.string()
      .required()
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

    imageURL: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    baseDenom: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    // decimals: Joi.number().optional(),
    decimals: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    coinType: Joi.string()
      .regex(/^[0-9]+$/)
      .allow('')
      .optional(),

    addressPrefix: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    gasRate: Joi.object<GasRate>({
      tiny: Joi.string()
        .required()
        .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/),
      low: Joi.string()
        .required()
        .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/),
      average: Joi.string()
        .required()
        .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/),
    }).optional(),
    sendGas: Joi.string()
      .regex(/^[0-9]+$/)
      .allow('')
      .optional(),
    cosmWasm: Joi.boolean().optional(),
  });
  // .label('params')
  // .required();

  return { addChainForm };
}
