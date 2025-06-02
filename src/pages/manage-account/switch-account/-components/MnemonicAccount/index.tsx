import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AccountImage from '@/components/AccountImage';
import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import NumberTypo from '@/components/common/NumberTypo';
import EmptyAsset from '@/components/EmptyAsset';
import VerifyPasswordBottomSheet from '@/components/VerifyPasswordBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as Home } from '@/pages/index';
import { Route as ManageBackupStep1 } from '@/pages/manage-account/backup-wallet/step1/$accountId';
import { Route as CreateAccountWithExistMnemonic } from '@/pages/manage-account/create-account/$mnemonicId';
import { toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AccountButton,
  AccountImgContainer,
  AccountInfoContainer,
  AccountLeftContainer,
  AccountRightContainer,
  ActiveBadge,
  BodyContainer,
  Container,
  EmptyAssetContainer,
  IconButtonText,
  LastHdPathIndexText,
  LastHdPathText,
  LastHdPathTextContainer,
  OutlinedButtonContainer,
  PlusIconContainer,
  Red400Text,
  RightArrowIconContainer,
  StyledOutlinedButton,
  TopContainer,
  TopLeftContainer,
  TopRightContainer,
} from './styled';

import ImportMnemonicIcon from '@/assets/images/icons/ImportMnemonic70.svg';
import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';
import RightArrowIcon from '@/assets/images/icons/RightArrow14.svg';
import CheckIcon from 'assets/images/icons/Check.svg';
import PlusIcon from 'assets/images/icons/Plus12.svg';

type MnemonicAccountProps = {
  search?: string;
};

export default function MnemonicAccount({ search }: MnemonicAccountProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [supposedToBackupAccountId, setSupposedToBackupAccountId] = useState<string | undefined>();

  const { currentAccount, setCurrentAccount } = useCurrentAccount();

  const { userAccounts, accountNamesById, mnemonicNamesByHashedMnemonic, notBackedUpAccountIds } = useExtensionStorageStore((state) => state);

  const mnemonicAccounts = useMemo(
    () =>
      userAccounts
        .filter((item) => item.type === 'MNEMONIC')
        .map((account) => ({
          encryptedRestoreString: account.encryptedRestoreString,
          mnemonicName: mnemonicNamesByHashedMnemonic[account.encryptedRestoreString] || '',
          lastHdPath: account.index,
          isNotBackedUp: notBackedUpAccountIds.includes(account.id),
          accounts: userAccounts
            .filter((item) => item.type === 'MNEMONIC' && item.encryptedRestoreString === account.encryptedRestoreString)
            .map((item) => ({
              ...item,
              accountName: accountNamesById[item.id],
            })),
        }))
        .filter((value, index, self) => self.findIndex((tx) => tx.encryptedRestoreString === value.encryptedRestoreString) === index),
    [accountNamesById, mnemonicNamesByHashedMnemonic, notBackedUpAccountIds, userAccounts],
  );

  const filteredMnemonicAccounts = useMemo(() => {
    if (!mnemonicAccounts) return [];

    const lowerSearch = search?.toLowerCase() ?? '';

    if (!lowerSearch) return mnemonicAccounts;

    return mnemonicAccounts
      .map(({ mnemonicName, accounts, ...rest }) => {
        const matchesMnemonicName = mnemonicName.toLowerCase().includes(lowerSearch);

        const filteredAccounts = accounts.filter((acc) => acc.accountName.toLowerCase().includes(lowerSearch));

        if (matchesMnemonicName || filteredAccounts.length > 0) {
          return {
            ...rest,
            mnemonicName,
            accounts: filteredAccounts.length > 0 ? filteredAccounts : accounts,
          };
        }

        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [mnemonicAccounts, search]);

  if (filteredMnemonicAccounts.length === 0) {
    return (
      <EmptyAssetContainer>
        <EmptyAsset
          icon={<ImportMnemonicIcon />}
          title={t('pages.manage-account.switch-account.entry.importMnemonic')}
          subTitle={t('pages.manage-account.switch-account.entry.importMnemonicDescription')}
        />
      </EmptyAssetContainer>
    );
  }

  return (
    <>
      {filteredMnemonicAccounts.map((item) => {
        return (
          <Container key={item.encryptedRestoreString}>
            <TopContainer>
              <TopLeftContainer>
                <MnemonicIcon />
                <Base1300Text variant="h4_B">{item.mnemonicName}</Base1300Text>
                {item.isNotBackedUp && <Red400Text variant="b4_M">{t('pages.manage-account.switch-account.components.notBackedUp')}</Red400Text>}
              </TopLeftContainer>
              <TopRightContainer>
                {!item.isNotBackedUp && (
                  <IconTextButton
                    onClick={() => {
                      navigate({
                        to: CreateAccountWithExistMnemonic.to,
                        params: {
                          mnemonicId: item.encryptedRestoreString,
                        },
                      });
                    }}
                    leadingIcon={
                      <PlusIconContainer>
                        <PlusIcon />
                      </PlusIconContainer>
                    }
                  >
                    <IconButtonText variant="b4_M">{t('pages.manage-account.switch-account.components.createNewWallet')}</IconButtonText>
                  </IconTextButton>
                )}
              </TopRightContainer>
            </TopContainer>
            <BodyContainer>
              {item.accounts.map((item, i) => {
                const accountName = accountNamesById[item.id];
                const lastHdPath = item.type === 'MNEMONIC' ? item.index : '';
                const isCurrentAccount = currentAccount?.id === item.id;

                return (
                  <AccountButton
                    key={i}
                    onClick={() => {
                      setCurrentAccount(item.id);

                      navigate({
                        to: Home.to,
                      });

                      toastSuccess(
                        t('pages.manage-account.switch-account.components.switchAccountSuccess', {
                          accountName,
                        }),
                      );
                    }}
                  >
                    <AccountLeftContainer>
                      <AccountImgContainer>
                        <AccountImage accountId={item.id} />
                      </AccountImgContainer>

                      <AccountInfoContainer>
                        <Base1300Text variant="b2_M">{accountName}</Base1300Text>
                        <LastHdPathTextContainer>
                          <LastHdPathText variant="b4_R">{`${t('pages.manage-account.switch-account.components.lastHdPath')} :`}</LastHdPathText>
                          &nbsp;
                          <LastHdPathIndexText>
                            <NumberTypo typoOfIntegers="h6n_M">{lastHdPath}</NumberTypo>
                          </LastHdPathIndexText>
                        </LastHdPathTextContainer>
                      </AccountInfoContainer>
                    </AccountLeftContainer>
                    <AccountRightContainer>
                      {isCurrentAccount && (
                        <ActiveBadge>
                          <CheckIcon />
                        </ActiveBadge>
                      )}
                    </AccountRightContainer>
                  </AccountButton>
                );
              })}
              {item.isNotBackedUp && (
                <OutlinedButtonContainer>
                  <StyledOutlinedButton
                    variant="dark"
                    typoVarient="b4_M"
                    trailingIcon={
                      <RightArrowIconContainer>
                        <RightArrowIcon />
                      </RightArrowIconContainer>
                    }
                    onClick={() => {
                      setSupposedToBackupAccountId(item.accounts[0].id);
                    }}
                  >
                    {t('pages.manage-account.switch-account.components.backUpNow')}
                  </StyledOutlinedButton>
                </OutlinedButtonContainer>
              )}
            </BodyContainer>
          </Container>
        );
      })}

      <VerifyPasswordBottomSheet
        open={!!supposedToBackupAccountId}
        onClose={() => setSupposedToBackupAccountId(undefined)}
        onSubmit={() => {
          navigate({
            to: ManageBackupStep1.to,
            params: {
              accountId: supposedToBackupAccountId || '',
            },
          });
        }}
      />
    </>
  );
}
