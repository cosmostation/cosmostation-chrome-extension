import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as bip39 from 'bip39';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import MnemonicViewer from '@/components/MnemonicViewer';
import SetAccountNameBottomSheet from '@/components/SetAccountNameBottomSheet';
import { addAccount } from '@/libs/account';
import { Route as Init } from '@/pages/account/initial';
// import { Route as Dashboard } from '@/pages/index';
import type { Account } from '@/types/account';
import { aesDecrypt, aesEncrypt } from '@/utils/crypto';
import { sha512 } from '@/utils/crypto/password';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';
import { useNewAccountStore } from '@/zustand/hooks/useNewAccountStore';
import { useNewPasswordStore } from '@/zustand/hooks/useNewPasswordStore';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle } from './-styled';

const mnemonicBits = {
  12: 128,
  24: 256,
} as const;

export type MnemonicBits = ValueOf<typeof mnemonicBits>;

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { password, key, timestamp } = useNewPasswordStore((state) => state);
  const { updateNewAccount } = useNewAccountStore((state) => state);

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);

  const [bits, setBits] = useState<MnemonicBits>(mnemonicBits[12]);
  const mnemonic = useMemo(() => bip39.generateMnemonic(bits), [bits]);

  const createMnemonicAccount = async (newAccountName: string) => {
    try {
      // NOTE 어드레스 밸런스 페칭 후 디폴트 코인타입패스 정하는 페이지에서 아래의 로직을 사용하고
      // NOTE 현 페이지에서는 일단 전역 스토어에 담아놓기만 하자.

      // NOTE 패스워드가 전역변수로 없을땐 다시 맨 처음부터 시작하도록 유도
      if (!password) {
        alert('password is not set, go back to initial page');

        navigate({
          to: Init.to,
        });
      }

      const storedAccountNames = await getExtensionLocalStorage('accountNamesById');
      const storedMnemonicNames = await getExtensionLocalStorage('mnemonicNamesByHashedMnemonic');

      const storedAccounts = await getExtensionLocalStorage('accounts');

      console.log('🚀 ~ createMnemonicAccount ~ accountList:', storedAccounts);

      const filteredMnemonicAccountList = storedAccounts.filter((account) => account.type === 'MNEMONIC');

      const accountId = uuidv4();

      const decryptedPassword = aesDecrypt(password, `${key}${timestamp}`);

      const encryptedMnemonic = aesEncrypt(mnemonic, decryptedPassword);
      const encryptedRestoreString = sha512(mnemonic);

      updateNewAccount({
        id: accountId,
        type: 'MNEMONIC',
        name: newAccountName,
        index: '0',
        mnemonic: encryptedMnemonic,
        encryptedRestoreString,
      });

      const newAccount: Account = {
        id: accountId,
        type: 'MNEMONIC',
        index: '0',
        mnemonic: encryptedMnemonic,
        encryptedRestoreString,
      };

      // TOOD: 이거는 코인타입패스 정하는 페이지에서 해야함.
      await addAccount(newAccount);

      // NOTE newAccount에 어카운트 네임을 같이 안담는 이유는,  어카운트 네임을 바꿀 때 마다 account객체를 건드려야하는데, 그건 좀 무서우니까 별도로 분리한다.
      await setExtensionLocalStorage('accountNamesById', { ...storedAccountNames, [accountId]: newAccountName });
      await setExtensionLocalStorage('mnemonicNamesByHashedMnemonic', {
        ...storedMnemonicNames,
        [encryptedRestoreString]: `Mnemonic ${filteredMnemonicAccountList.length + 1}`,
      });

      const comparisonPasswordHash = sha512(decryptedPassword);
      // NOTE 원래 익스텐션에서는 sha512(패스워드 스트링)한 값을 스토리지에 저장해놓고 Lock컴포넌트에서 비밀번호를 받아서 sha512(입력받은 비밀번호)한 값을 비교하는 방식을 사용했는데
      await setExtensionLocalStorage('comparisonPasswordHash', comparisonPasswordHash);

      // TODO 로컬 스토리지 대신 세션스토리지로 변경 필요
      // NOTE 만약 이걸 로컬에 담았을때 외부에서 로컬 스토리지에 접근해서 데이터를 가져가면 어떡함?
      // NOTE 일정 시간뒤에 자동적으로 password의 encryptedPassword 키만 삭제해야함.
      await setExtensionLocalStorage('password', {
        encryptedPassword: password,
        key,
        timestamp,
      });

      // NOTE 1. address생성 밑 밸런스 페칭 로직(맨 처음은 메이저 코인에 대해서만 밸런스를 가져오도록 별도 처리 필요)
      // NOTE 2. 로딩 프로그래스 컴포넌트,페이지 필요.
      // await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [accountId] });
      // await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [accountId] });

      // NOTE 이건 로딩 프로그래스 컴포넌트가 끝나면 이동되도록 해야할듯.
      // navigate({
      //   to: Dashboard.to,
      // });

      // await setExtensionStorage('selectedAccountId', id);
      // await setExtensionStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);
    } catch (error) {
      // NOTE 스낵바
      console.error(error);
    }
  };

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
        setAccountName={(accountName) => {
          createMnemonicAccount(accountName);
        }}
      />
    </>
  );
}
