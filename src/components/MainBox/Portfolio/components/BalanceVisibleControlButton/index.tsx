import { useTranslation } from 'react-i18next';

import { ViewTotalValueText } from '../../styled';

export default function BalanceVisibleControlButton() {
  const { t } = useTranslation();

  return <ViewTotalValueText variant="b3_M">{t('components.MainBox.Portfolio.index.totalValue')}</ViewTotalValueText>;
}
