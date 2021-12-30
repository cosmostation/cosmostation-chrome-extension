import { ACCOUNT_COIN_TYPE } from '~/constants/chromeStorage';
import { TRANSPORT_TYPE } from '~/constants/ledger';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import Joi from '~/Popup/utils/joi';
import type { AccountCoinType } from '~/types/chromeStorage';
import type { TransportType } from '~/types/ledger';

export type Step1Form = {
  transportType: TransportType;
};

export function useSchema() {
  const { t } = useTranslation();

  const transportType = Object.values(TRANSPORT_TYPE);
  const step1FormSchema = Joi.object<Step1Form>({
    transportType: Joi.string()
      .required()
      .valid(...transportType),
  });

  return { step1FormSchema };
}
