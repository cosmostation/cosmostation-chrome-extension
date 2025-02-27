import { COSMOS_TYPE } from '@/constants/cosmos';
import type { AddChainGasRate } from '@/types/fee';
import type { CosRequestAddChain } from '@/types/message/inject/cosmos';
import Joi from '@/utils/joi';

const cosmosType = Object.values(COSMOS_TYPE);

export const cosAddChainParamsSchema = (chainNames: string[], officialChainIds: string[], unofficialChainIds: string[]) => {
  const invalidChainNames = [...chainNames, ...officialChainIds, ...unofficialChainIds];

  return Joi.object<CosRequestAddChain['params']>({
    type: Joi.string()
      .valid(...cosmosType)
      .default(''),
    chainId: Joi.string()
      .lowercase()
      .invalid(...officialChainIds)
      .required(),
    chainName: Joi.string()
      .invalid(...invalidChainNames)
      .insensitive()
      .required(),
    restURL: Joi.string().required(),
    tokenImageURL: Joi.string().empty('').optional(),
    imageURL: Joi.string().empty('').optional(),
    baseDenom: Joi.string().required(),
    displayDenom: Joi.string().required(),
    decimals: Joi.number().optional(),
    coinType: Joi.string()
      .regex(/^[0-9]+'?$/)
      .optional(),
    addressPrefix: Joi.string().required(),
    coinGeckoId: Joi.string().optional(),
    gasRate: Joi.object<AddChainGasRate>({
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
};
