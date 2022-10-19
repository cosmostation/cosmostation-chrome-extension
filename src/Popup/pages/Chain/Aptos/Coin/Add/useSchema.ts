import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';

export type ImportTokenForm = {
  address: string;
  imageURL?: string;
};

type UseSchemaProps = {
  chain: CosmosChain;
};

export function useSchema({ chain }: UseSchemaProps) {
  const { t } = useTranslation();

  const regex = getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]);

  const importTokenForm = Joi.object<ImportTokenForm>({
    address: Joi.string()
      .required()
      .pattern(regex)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'string.pattern.base': t('schema.importTokenForm.address.string.pattern.base'),
      }),
    imageURL: Joi.string()
      .allow('')
      .optional()
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
      }),
  });

  return { importTokenForm };
}
