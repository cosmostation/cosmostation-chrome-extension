import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';

import { Divider, DividerContainer, LineDivider, TxBaseInfoContainer } from './-styled';
import BaseTxInfo from '../../-components/BaseTxInfo';
import DappInfo from '../../-components/DappInfo';
import MemoInput from '../../-components/MemoInput';

export default function Entry() {
  const { t } = useTranslation();

  const [inputMemo, setInputMemo] = useState('memo');

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image="https://osmosis.zone/favicon.ico" name="Osmosis.zone" url="https://osmosis.zone" />
          <Divider />
          <TxBaseInfoContainer>
            <BaseTxInfo chainId="cosmos-cosmos" feeCoinId="uatom-cosmos-cosmos" feeBaseAmount="1415" />
          </TxBaseInfoContainer>
          <DividerContainer>
            <Divider />
          </DividerContainer>

          <MemoInput
            memo={inputMemo}
            isEditMemo
            onChangeMemo={(memo) => {
              setInputMemo(memo);
            }}
          />
          <LineDivider />
        </EdgeAligner>
      </BaseBody>
      <BaseFooter>
        <SplitButtonsLayout
          cancelButton={
            <Button
              onClick={() => {
                console.log('🚀 ~ Entry ~ cancelButton ~ onClick');
              }}
              variant="dark"
            >
              {t('pages.popup.cosmos.sign.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button
              onClick={() => {
                console.log('🚀 ~ Entry ~ confirmButton ~ onClick');
              }}
            >
              {t('pages.popup.cosmos.sign.entry.sign')}
            </Button>
          }
        />
      </BaseFooter>
    </>
  );
}
