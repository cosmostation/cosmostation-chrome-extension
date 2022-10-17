// import { COSMOS_CHAINS } from '~/constants/chain';
import { COSMOS_CHAINS } from '~/constants/chain';
import { COSMOS_TYPE } from '~/constants/cosmos';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import type { CosmosType } from '~/types/chain';

export type AddChainForm = {
  ''?: string;
  type?: CosmosType;
  chainId: string;
  chainName: string;
  restURL: string;
  imageURL?: string;
  baseDenom: string;
  displayDenom: string;
  decimals?: number;
  coinType?: string;
  addressPrefix: string;
  coinGeckoId?: string;
  gasRateTiny?: string;
  gasRateLow?: string;
  gasRateAverage?: string;
  sendGas?: string;
  cosmWasm?: boolean;
};

export function useSchema() {
  const { t } = useTranslation();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  const cosmosType = Object.values(COSMOS_TYPE);

  const officialCosmosLowercaseChainNames = COSMOS_CHAINS.map((item) => item.chainName.toLowerCase());
  const officialCosmosLowercaseChainIds = COSMOS_CHAINS.map((item) => item.chainId.toLowerCase());
  const unofficialCosmosLowercaseChainIds = currentCosmosAdditionalChains.map((item) => item.chainId.toLowerCase());
  const unofficialCosmosLowercaseChainNames = currentCosmosAdditionalChains.map((item) => item.chainName.toLowerCase());

  const invalidChainId = [...officialCosmosLowercaseChainIds, ...unofficialCosmosLowercaseChainIds];
  const invalidChainNames = [
    ...officialCosmosLowercaseChainNames,
    ...officialCosmosLowercaseChainIds,
    ...unofficialCosmosLowercaseChainNames,
    ...unofficialCosmosLowercaseChainIds,
  ];

  const addChainForm = Joi.object<AddChainForm>({
    type: Joi.string()
      .optional()
      .empty('')
      .valid(...cosmosType)
      .messages({
        'string.base': t('schema.common.string.base'),
        'any.only': t('schema.addChainForm.type.string.any.invalid'),
      }),
    chainId: Joi.string()
      .required()
      .lowercase()
      .invalid(...invalidChainId)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.invalid': t('schema.addChainForm.chainId.any.invalid'),
      }),
    chainName: Joi.string()
      .required()
      .lowercase()
      .invalid(...invalidChainNames)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.invalid': t('schema.addChainForm.chainName.any.invalid'),
      }),
    restURL: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    imageURL: Joi.string()
      .optional()
      .empty('')
      .messages({
        'string.base': t('schema.common.string.base'),
      }),
    baseDenom: Joi.string()
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
    decimals: Joi.number()
      .optional()
      .empty('')
      .messages({
        'number.base': t('schema.common.number.base'),
      }),
    coinType: Joi.string()
      .optional()
      .empty('')
      .pattern(/^[0-9]+$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.pattern.base': t('schema.common.number.base'),
      }),
    addressPrefix: Joi.string()
      .required()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    coinGeckoId: Joi.string()
      .optional()
      .empty('')
      .messages({
        'string.base': t('schema.common.string.base'),
      }),
    gasRateTiny: Joi.string()
      .optional()
      .empty('')
      .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.pattern.base': t('schema.addChainForm.decimal.base'),
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
    sendGas: Joi.string()
      .optional()
      .empty('')
      .pattern(/^[0-9]+$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.pattern.base': t('schema.common.number.base'),
      }),
    cosmWasm: Joi.boolean()
      .optional()
      .empty('')
      .messages({
        'boolean.base': t('schema.common.boolean.base'),
      }),
  })
    .and('gasRateTiny', 'gasRateLow', 'gasRateAverage')
    .messages({
      'object.and': t('schema.addChainForm.gasRate.object.and'),
    });
  return { addChainForm };
}
