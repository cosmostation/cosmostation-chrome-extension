import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// import { useNavigate } from '@tanstack/react-router';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import InformationPanel from '@/components/InformationPanel';
import SetAccountNameBottomSheet from '@/components/SetAccountNameBottomSheet';

import CoinTypeSelector from './-components/CoinTypeSelector';
import { Body, CoinTypeSelectorContainer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  // const navigate = useNavigate();

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);

  // FIXME 카바 토큰이 리스팅되지 않는 이슈??
  // NOTE accountAssets에서 코인타입이 여러개 인 데이터 리스팅

  return (
    <>
      <BaseBody>
        <Body>
          <InformationPanel
            varitant="info"
            titleText={t('pages.account.restore-wallet.coin-type-setting.entry.infoTitle')}
            bodyText={t('pages.account.restore-wallet.coin-type-setting.entry.infoBody')}
          />
          <CoinTypeSelectorContainer>
            <CoinTypeSelector />
          </CoinTypeSelectorContainer>
        </Body>
      </BaseBody>
      <BaseFooter>
        <Button
          onClick={() => {
            setIsOpenSetAccountNameBottomSheet(true);
          }}
        >
          {t('pages.account.restore-wallet.coin-type-setting.entry.next')}
        </Button>
      </BaseFooter>
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setAccountName={async (accountName) => {
          console.log('🚀 ~ setAccountName={ ~ accountName:', accountName);

          // await setUp(accountName);
        }}
      />
    </>
  );
}
