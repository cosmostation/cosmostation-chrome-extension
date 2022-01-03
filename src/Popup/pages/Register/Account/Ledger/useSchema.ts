import { ACCOUNT_COIN_TYPE } from '~/constants/chromeStorage';
import { TRANSPORT_TYPE } from '~/constants/ledger';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import type { AccountCoinType } from '~/types/chromeStorage';
import type { TransportType } from '~/types/ledger';

export type LedgerForm = {
  transportType: TransportType;
  name: string;
};

type useSchemaProps = {
  name: string[];
};

export function useSchema({ name }: useSchemaProps) {
  const { t } = useTranslation();

  const transportType = Object.values(TRANSPORT_TYPE);
  const ledgerFormSchema = Joi.object<LedgerForm>({
    transportType: Joi.string()
      .required()
      .valid(...transportType),
    name: Joi.string()
      .required()
      .invalid(...name)
      .messages({
        'string.base': t('schema.common.string.base'),
        'string.empty': t('schema.common.string.empty'),
        'any.invalid': t('schema.mnemonicForm.name.any.invlid'),
      }),
  });

  return { ledgerFormSchema };
}
