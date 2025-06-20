import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import EmptyAsset from '@/components/EmptyAsset';
import { UNIVERSAL_EVM_NETWORK_ID } from '@/pages/general-setting/address-book/add-address/-entry';
import type { UniqueChainId } from '@/types/chain';
import { getUniqueChainIdWithManual, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import Badge from './components/Badge';
import {
  AddressContainer,
  Container,
  ContentsContainer,
  EmptyAssetContainer,
  LabelContainer,
  MemoContainer,
  MemoContentsContainer,
  StyledOptionButton,
} from './styled';

import NoListIcon from '@/assets/images/icons/NoList70.svg';

import ensImage from '@/assets/images/logos/ens.png';

type PrivatekeyAccountProps = {
  chainId: UniqueChainId;
  searchText?: string;
  onClickAddress: (address: string, memo?: string) => void;
};

export default function AddressBookItem({ chainId, searchText, onClickAddress }: PrivatekeyAccountProps) {
  const { t } = useTranslation();

  const { addressBookList } = useExtensionStorageStore((state) => state);

  const filteredAddress = useMemo(
    () =>
      addressBookList.filter((item) => {
        if (parseUniqueChainId(chainId).chainType === 'evm') {
          return item.chainId === chainId || item.chainId === getUniqueChainIdWithManual(UNIVERSAL_EVM_NETWORK_ID, 'evm');
        }

        return item.chainId === chainId;
      }),
    [addressBookList, chainId],
  );

  const filteredAddressBySearch = useMemo(() => {
    if (searchText) {
      const filterKeyword = searchText.toLowerCase();

      return (
        filteredAddress.filter((item) => {
          const condition = [item.label, item.address];

          return condition.some((item) => item.toLowerCase().indexOf(filterKeyword) > -1);
        }) || []
      );
    }
    return filteredAddress;
  }, [filteredAddress, searchText]);

  if (filteredAddressBySearch.length === 0) {
    return (
      <EmptyAssetContainer>
        <EmptyAsset
          icon={<NoListIcon />}
          title={t('components.AddressBook.index.noAddressBookItem')}
          subTitle={t('components.AddressBook.index.noAddressBookItemDescription')}
        />
      </EmptyAssetContainer>
    );
  }

  return (
    <Container>
      {filteredAddressBySearch.map((item) => {
        const { label, address, memo } = item;
        const isBadge = !!memo;

        const badgeContent = (() => {
          if (isBadge) {
            const isENS = memo?.includes('ENS');

            if (isENS) {
              return {
                name: 'ENS',
                image: ensImage,
                color: '#508FFF',
              };
            }

            return {
              name: 'UPBIT EXCHANGE',
            };
          }

          return null;
        })();

        return (
          <StyledOptionButton
            key={item.id}
            leftContent={
              <ContentsContainer>
                <LabelContainer>
                  <Base1300Text variant="b2_M">{label}</Base1300Text>
                  {badgeContent && (
                    <Badge
                      style={{
                        visibility: 'hidden',
                      }}
                      name={badgeContent.name}
                      image={badgeContent.image}
                      colorHex={badgeContent.color}
                    />
                  )}
                </LabelContainer>
                <AddressContainer>
                  <Typography variant="b4_M">{address}</Typography>
                </AddressContainer>

                {memo && (
                  <MemoContainer>
                    <Base1000Text variant="b3_R">{t('components.AddressBook.index.memo')}</Base1000Text>
                    &nbsp;
                    <MemoContentsContainer>
                      <Base1000Text variant="b3_R">{memo}</Base1000Text>
                    </MemoContentsContainer>
                  </MemoContainer>
                )}
              </ContentsContainer>
            }
            disableRightChevron
            onClick={() => {
              onClickAddress?.(address, memo);
            }}
          />
        );
      })}
    </Container>
  );
}
