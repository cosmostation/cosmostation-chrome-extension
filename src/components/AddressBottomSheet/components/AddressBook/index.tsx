import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import type { UniqueChainId } from '@/types/chain';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import Badge from './components/Badge';
import { AddressContainer, Container, ContentsContainer, LabelContainer, MemoContainer, MemoContentsContainer, StyledOptionButton } from './styled';

import ENS from '@/assets/images/logos/ENS.png';

type PrivatekeyAccountProps = {
  chainId: UniqueChainId;
  onClickAddress: (address: string, memo?: string) => void;
};

export default function AddressBookItem({ chainId, onClickAddress }: PrivatekeyAccountProps) {
  const { t } = useTranslation();

  const { addressBookList } = useExtensionStorageStore((state) => state);

  const filteredAddress = addressBookList.filter((item) => item.chainId === chainId);

  return (
    <Container>
      {filteredAddress.map((item) => {
        const { label, address, memo } = item;
        const isBadge = !!memo;

        const badgeContent = (() => {
          if (isBadge) {
            const isENS = memo?.includes('ENS');

            if (isENS) {
              return {
                name: 'ENS',
                image: ENS,
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
                  {badgeContent && <Badge name={badgeContent.name} image={badgeContent.image} colorHex={badgeContent.color} />}
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
