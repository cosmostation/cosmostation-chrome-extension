// import { COSMOS_CHAINS } from '~/constants/chain';
import { COSMOS_TYPE } from '~/constants/cosmos';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import type { GasRate } from '~/types/chain';
import type { CosAddChainParams } from '~/types/message/cosmos';

export function useSchema() {
  const { t } = useTranslation();

  const cosmosType = Object.values(COSMOS_TYPE);
  // const officialCosmosLowercaseChainIds = COSMOS_CHAINS.map((item) => item.chainId.toLowerCase());

  // FIXME 현재 옵션값 미 입력시 undefine이 아닌 ''가 입력되어서 newChain할당시에 값이 ''가 들어감
  // -> .empty('')  엠티 필드를 오버라이딩함

  // FIXME 가스 비율 인풋을 아예 비우거나 하나를 입력했을때는 모두 입력하도록 걸고 싶음
  // -> .and() 로 해결한 듯
  // FIXME 1개만 입력시 에러는 나는데 에러 메시지가 안나옴

  // FIXME 가스레이트 값 미입력시 undefine으로 넘어가지 않음...

  // TODO 가스 레이트에도 메시지 달아주기
  const addChainForm = Joi.object<CosAddChainParams>({
    type: Joi.string()
      .optional()
      .empty('')
      .valid(...cosmosType)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.only': t('schema.addChainForm.address.string.any.invalid'),
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
    gasRate: Joi.object<GasRate>({
      tiny: Joi.string()
        .optional()
        .empty('')
        .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
        .messages({
          'string.pattern.base': t('schema.common.decimal.base'),
        }),
      low: Joi.string()
        .optional()
        .empty('')
        .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
        .messages({
          'string.pattern.base': t('schema.common.decimal.base'),
        }),
      average: Joi.string()
        .optional()
        .empty('')
        .regex(/^([0-9]+\.?[0-9]*|\.[0-9]+)$/)
        .messages({
          'string.pattern.base': t('schema.common.decimal.base'),
        }),
    })
      .and('tiny', 'low', 'average')
      .optional()
      .empty('')
      .messages({
        'object.and': t('schema.common.object.and'),
      }),
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

  return { addChainForm };
}
