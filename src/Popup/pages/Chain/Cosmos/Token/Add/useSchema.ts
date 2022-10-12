// import { COSMOS_CHAINS } from '~/constants/chain';
import { COSMOS_TYPE } from '~/constants/cosmos';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import type { CosmosType } from '~/types/chain';

export type AddChainForm = {
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

  const cosmosType = Object.values(COSMOS_TYPE);

  const addChainForm = Joi.object<AddChainForm>({
    type: Joi.string()
      .optional()
      .empty('')
      .valid(...cosmosType)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.only': t('schema.addChainForm.type.string.any.invalid'),
      }),
    chainId: Joi.string()
      .required()
      .lowercase()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
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
    imageURL: Joi.string()
      .optional()
      .empty('')
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
        'number.empty': t('schema.common.number.empty'),
      }),
    coinType: Joi.string()
      .optional()
      .empty('')
      .pattern(/^[0-9]+$/)
      .messages({
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
        'string.empty': t('schema.common.string.empty'),
      }),
    gasRateTiny: Joi.string()
      .optional()
      .empty('')
      .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    gasRateLow: Joi.string()
      .optional()
      .empty('')
      .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    gasRateAverage: Joi.string()
      .optional()
      .empty('')
      .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    // gasRate: Joi.object<GasRate>({
    //   tiny: Joi.string()
    //     .optional()
    //     .empty('')
    //     .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
    //     .messages({
    //       'string.pattern.base': t('schema.common.decimal.base'),
    //       'object.and': t('schema.common.object.and'),
    //     }),
    //   low: Joi.string()
    //     .optional()
    //     .empty('')
    //     .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
    //     .messages({
    //       'string.pattern.base': t('schema.common.decimal.base'),
    //       'object.and': t('schema.common.object.and'),
    //     }),
    //   average: Joi.string()
    //     .optional()
    //     .empty('')
    //     .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
    //     .messages({
    //       'string.pattern.base': t('schema.common.decimal.base'),
    //       'object.and': t('schema.common.object.and'),
    //     }),
    // })
    //   .and('tiny', 'low', 'average')
    //   .optional()
    //   .empty('')
    //   .messages({
    //     'object.base': t('schema.common.object.and'),
    //     'object.and': t('schema.common.object.and'),
    //     'object.missing': t('schema.common.object.and'),
    //   }),
    sendGas: Joi.string()
      .optional()
      .empty('')
      .pattern(/^[0-9]+$/)
      .messages({
        'string.pattern.base': t('schema.common.number.base'),
      }),
    cosmWasm: Joi.boolean()
      .optional()
      .empty('')
      .messages({
        'boolean.base': t('schema.common.boolean.base'),
      }),
  });
  // .and('gasRateLow', 'gasRateTiny', 'gasRateAverage')
  // .messages({
  //   "object.and.missing": t('schema.common.object.and'),
  // });
  // 엔트리에서 가스 레이트 일관성 컨트롤 하기 위해서 여기서 .and뺌
  return { addChainForm };
}
