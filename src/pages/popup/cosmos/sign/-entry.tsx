import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import { StyledTabPanel } from '@/pages/-styled';

import { Divider, DividerContainer, LineDivider, StickyTabContainer, TxBaseInfoContainer } from './-styled';
import BaseTxInfo from '../../-components/BaseTxInfo';
import DappInfo from '../../-components/DappInfo';
import MemoInput from '../../-components/MemoInput';

export default function Entry() {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Detail', 'Data'];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

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
          <StickyTabContainer>
            <FilledTabs value={tabValue} onChange={handleChange} variant="fullWidth">
              {tabLabels.map((item) => (
                <FilledTab key={item} label={item} />
              ))}
            </FilledTabs>
          </StickyTabContainer>
          <StyledTabPanel value={tabValue} index={0}>
            <>a</>
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <>a</>
          </StyledTabPanel>
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
