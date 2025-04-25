import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import StandardInput from '@/components/common/StandardInput';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as Dashboard } from '@/pages/index';
import type { AccountWithName } from '@/types/account';
import type { AptosChain, BitcoinChain, CosmosChain, EvmChain, SuiChain } from '@/types/chain';
import { isNumber } from '@/utils/string';
import { toastError } from '@/utils/toast';
import { addPreferAccountType } from '@/utils/zustand/preferAccountType';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  Body,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  FormContainer,
  InputContainer,
  MajorNetwork,
  MajorNetworkContainer,
  MajorNetworkImage,
  MajorNetworkLeftContainer,
  MajorNetworkRightContainer,
  MajorNetworkText,
  MajorNetworkTextContainer,
} from './-styled';
import type { NewAccountForm } from './-useSchema';
import { useSchema } from './-useSchema';

type EntryProps = {
  mnemonicId: string;
};

export default function Entry({ mnemonicId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userAccounts } = useExtensionStorageStore((state) => state);
  const { addAccountWithName, setCurrentAccount } = useCurrentAccount();

  const { flatChainList } = useChainList();

  const mnemonicAccount = userAccounts.find((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === mnemonicId);

  const { newAccountForm } = useSchema();

  const [isLoadingSetup, setIsLoadingSetup] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<NewAccountForm>({
    resolver: joiResolver(newAccountForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      hdPathIndex: '0',
    },
  });

  const { accountName, hdPathIndex } = watch();
  const isButtonEnabled = !!accountName?.trim() && !!hdPathIndex;

  const majorNetworkIds = ['cosmos', 'bitcoin', 'ethereum'];
  const majorNetwork = majorNetworkIds
    .map((id) => flatChainList.find((chain) => chain.id === id))
    .filter((chain): chain is CosmosChain | EvmChain | SuiChain | AptosChain | BitcoinChain => chain !== undefined);

  const submit = async (data: NewAccountForm) => {
    try {
      if (!mnemonicAccount) {
        toastError(t('pages.manage-account.create-account.entry.failToFindMnemonic'));
      }
      setIsLoadingSetup(true);

      if (mnemonicAccount?.type === 'MNEMONIC') {
        const accountId = uuidv4();

        const newAccount: AccountWithName = {
          id: accountId,
          type: 'MNEMONIC',
          name: data.accountName,
          index: data.hdPathIndex,
          encryptedMnemonic: mnemonicAccount.encryptedMnemonic,
          encryptedRestoreString: mnemonicAccount.encryptedRestoreString,
        };

        await addAccountWithName(newAccount);

        await addPreferAccountType(newAccount.id);

        await setCurrentAccount(newAccount.id);

        navigate({
          to: Dashboard.to,
        });

        reset();
      }
    } catch {
      toastError(t('pages.manage-account.create-account.entry.setupFail'));
    } finally {
      setIsLoadingSetup(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit(submit)}>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.manage-account.create-account.entry.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.manage-account.create-account.entry.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>
          <InputContainer>
            <StandardInput
              label={t('pages.manage-account.create-account.entry.accountName')}
              error={!!errors.accountName}
              helperText={errors.accountName?.message}
              slotProps={{
                input: {
                  ...register('accountName'),
                },
              }}
            />
            <StandardInput
              label={t('pages.manage-account.create-account.entry.lastHdPathIndex')}
              error={!!errors.hdPathIndex}
              helperText={errors.hdPathIndex?.message}
              type="number"
              slotProps={{
                input: {
                  ...register('hdPathIndex', {
                    setValueAs: (v: string) => (v && isNumber(v) ? v : ''),
                  }),
                },
              }}
            />
          </InputContainer>
          <MajorNetworkTextContainer>
            <MajorNetworkText variant="h4_B">{t('pages.manage-account.create-account.entry.majorNetwork')}</MajorNetworkText>
          </MajorNetworkTextContainer>
          {majorNetwork.map((network) => {
            const { name, image, id } = network || {};
            const defaultHdPath = network?.accountTypes.find(({ isDefault }) => isDefault === null)?.hdPath || '';

            const splitHdPath = defaultHdPath.split('${index}');
            const head = splitHdPath[0].split('/').join(' / ');
            const tail = splitHdPath[1].split('/').join(' / ');

            return (
              <MajorNetworkContainer key={id}>
                <MajorNetwork>
                  <MajorNetworkLeftContainer>
                    <MajorNetworkImage src={image} />
                    <Base1300Text variant="b2_M">{name}</Base1300Text>
                  </MajorNetworkLeftContainer>
                  <MajorNetworkRightContainer>
                    <Base1000Text variant="h5n_M">{head}</Base1000Text>
                    &nbsp;
                    <Base1300Text variant="h5n_M">{hdPathIndex}</Base1300Text>
                    &nbsp;
                    <Base1000Text variant="h5n_M">{tail}</Base1000Text>
                  </MajorNetworkRightContainer>
                </MajorNetwork>
              </MajorNetworkContainer>
            );
          })}
        </Body>
      </BaseBody>
      <BaseFooter>
        <Button type="submit" disabled={!isButtonEnabled} isProgress={isLoadingSetup}>
          {t('pages.manage-account.create-account.entry.setUpComplete')}
        </Button>
      </BaseFooter>
    </FormContainer>
  );
}
