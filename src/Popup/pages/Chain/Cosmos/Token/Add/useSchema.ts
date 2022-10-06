import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import { hexRegex } from '~/Popup/utils/regex';
import type { EthereumNetwork, GasRate } from '~/types/chain';
import type { CosAddChain } from '~/types/message/cosmos';

export type AddNetworkForm = Pick<EthereumNetwork, 'chainId' | 'networkName' | 'rpcURL' | 'displayDenom' | 'explorerURL' | 'imageURL' | 'coinGeckoId'>;
// export type AddChainForm = Pick<CosmosChain, 'chainId' | 'chainName' | 'restURL' |'baseDenom' |'coinType' | 'displayDenom' | 'explorerURL' | 'imageURL' | 'coinGeckoId'>;

export function useSchema() {
  const { t } = useTranslation();
  // TODO delete here
  const addNetworkForm = Joi.object<AddNetworkForm>({
    chainId: Joi.string()
      .required()
      .pattern(hexRegex)
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
    imageURL: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
  });

  // 받아야 하는 필드
  //  addressPrefix,
  // baseDenom,
  // chainId,
  // chainName,
  // displayDenom,
  // restURL,
  // coinGeckoId,
  // coinType,
  // decimals,
  // gasRate,
  // imageURL,
  // sendGas,
  // type,
  // cosmWasm,

  const addChainForm = Joi.object<CosAddChain['params']>({
    type: Joi.string()
      // .valid(...cosmosType)
      .default(''),
    chainId: Joi.string()
      .lowercase()
      // .invalid(...officialChainIds)
      .required(),
    chainName: Joi.string()
      .lowercase()
      // .invalid(...invalidChainNames)
      .required(),
    restURL: Joi.string().required(),
    imageURL: Joi.string().optional(),
    baseDenom: Joi.string().required(),
    displayDenom: Joi.string().required(),
    decimals: Joi.number().optional(),
    coinType: Joi.string()
      .regex(/^[0-9]+$/)
      .optional(),
    addressPrefix: Joi.string().required(),
    coinGeckoId: Joi.string().optional(),
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
      .optional(),
    cosmWasm: Joi.boolean().optional(),
  })
    .label('params')
    .required();
  return { addNetworkForm, addChainForm };
}
