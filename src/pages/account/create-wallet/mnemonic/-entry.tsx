import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as bip39 from 'bip39';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import MnemonicViewer from '@/components/MnemonicViewer';
import SetAccountNameBottomSheet from '@/components/SetAccountNameBottomSheet';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle } from './-styled';

const mnemonicBits = {
  12: 128,
  24: 256,
} as const;

export type MnemonicBits = ValueOf<typeof mnemonicBits>;

export default function Entry() {
  const { t } = useTranslation();

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);

  const [bits, setBits] = useState<MnemonicBits>(mnemonicBits[12]);
  const mnemonic = useMemo(() => bip39.generateMnemonic(bits), [bits]);

  const [inputAccountName, setinputAccountName] = useState('');

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.account.create-mnemonic.mnemonic.index.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.account.create-mnemonic.mnemonic.index.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>
          <MnemonicViewer
            rawMnemonic={mnemonic}
            onClickMnemonicBits={(val) => {
              setBits(val);
            }}
          />
        </Body>
      </BaseBody>
      <BaseFooter>
        <Button
          onClick={() => {
            setIsOpenSetAccountNameBottomSheet(true);
          }}
        >
          {t('pages.account.create-mnemonic.mnemonic.index.next')}
        </Button>
      </BaseFooter>
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        currentAccountName={inputAccountName}
        setAccountName={(accountName) => {
          setinputAccountName(accountName);
        }}
      />
    </>
  );
}
