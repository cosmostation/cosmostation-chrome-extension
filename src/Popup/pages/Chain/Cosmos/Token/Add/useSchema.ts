// import { COSMOS_CHAINS } from '~/constants/chain';
import { COSMOS_TYPE } from '~/constants/cosmos';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import type { GasRate } from '~/types/chain';
import type { CosAddChain } from '~/types/message/cosmos';

// export type AddChainForm = Pick<CosmosChain, 'chainId' | 'chainName' | 'restURL' |'baseDenom' |'coinType' | 'displayDenom' | 'explorerURL' | 'imageURL' | 'coinGeckoId'>;

export function useSchema() {
  const { t } = useTranslation();

  const cosmosType = Object.values(COSMOS_TYPE);
  // const officialCosmosLowercaseChainIds = COSMOS_CHAINS.map((item) => item.chainId.toLowerCase());

  // FIXME 현재 옵션값 미 입력시 undefine이 아닌 ''가 입력되어서 newChain할당시에 값이 ''가 들어감
  const addChainForm = Joi.object<CosAddChain['params']>({
    // type: Joi.string()
    //   .valid(...cosmosType)
    //   .default(''),
    type: Joi.string()
      .optional()
      .allow('')
      .valid(...cosmosType)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    chainId: Joi.string()
      .required()
      .lowercase()
      // 위에서 강제로 소문자형변환 했음, 중복 체크는 뒤에서 하기위해 지움
      // .invalid(...officialCosmosLowercaseChainIds)
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
    displayDenom: Joi.string()
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
    // decimals: Joi.number().optional(),
    decimals: Joi.string()
      .optional()
      .empty('')
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
    coinType: Joi.string()
      .optional()
      .empty('')
      .pattern(/^[0-9]+$/)
      .messages({
        'string.pattern.base': t('schema.addNetworkForm.address.string.pattern.base'),
      }),

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
    })
      .optional()
      .empty(''),
    sendGas: Joi.string()
      .optional()
      .empty('')
      .pattern(/^[0-9]+$/)
      .messages({
        'string.pattern.base': t('schema.common.number.base'),
      }),
    cosmWasm: Joi.boolean().optional().empty(''),
  });
  // .label('params')
  // .required();

  return { addChainForm };
}
