import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as bip39 from 'bip39';
import { Button } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import MnemonicBox from '@/components/Mnemonic';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle } from './-styled';

const mnemonicBits = {
  12: 128,
  24: 256,
} as const;

type MnemonicBits = ValueOf<typeof mnemonicBits>;

export default function Entry() {
  const { t } = useTranslation();

  // const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);
  const [bits] = useState<MnemonicBits>(mnemonicBits[12]);

  const mnemonic = useMemo(() => bip39.generateMnemonic(bits), [bits]);

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.account.create-mnemonic.mnemonic.index.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R">{t('pages.account.create-mnemonic.mnemonic.index.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>
          <MnemonicBox rawMnemonic={mnemonic} />
        </Body>
      </BaseBody>
      <BaseFooter>
        <Button type="button">{t('pages.account.create-mnemonic.mnemonic.index.next')}</Button>
      </BaseFooter>
    </>
  );
}
