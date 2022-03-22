import Joi from '~/Popup/utils/joi';
import type { GasRate } from '~/types/chain';
import type { TenAddChainParams } from '~/types/tendermint/message';

export const tenAddChainParamsSchema = Joi.object<TenAddChainParams>({
  chainId: Joi.string().required(),
  chainName: Joi.string().lowercase().required(),
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
});
