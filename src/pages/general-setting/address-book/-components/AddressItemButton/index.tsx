import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';

import Badge from './components/Badge';
import { AddressContainer, ChainContainer, ChainImage, Container, LabelContainer, MemoContainer, MemoContentsContainer, StyledOptionButton } from './styled';

import ENS from '@/assets/images/logos/ENS.png';

type AddressItemButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  id: string;
  address: string;
  label: string;
  chainName: string;
  memo?: string;
  chainImage?: string;
  onSelectOption?: (id: string) => void;
};

export default function AddressItemButton({ id, address, label, memo, chainName, chainImage, onSelectOption, ...remainder }: AddressItemButtonProps) {
  const { t } = useTranslation();

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
      leftContent={
        <Container>
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
              <Base1000Text variant="b3_R">{t('pages.general-setting.address-book.components.AddressItemBook.index.memo')}</Base1000Text>
              &nbsp;
              <MemoContentsContainer>
                <Base1000Text variant="b3_R">{memo}</Base1000Text>
              </MemoContentsContainer>
            </MemoContainer>
          )}
          <ChainContainer>
            <ChainImage src={chainImage} />
            <Base1000Text variant="b4_M">{chainName}</Base1000Text>
          </ChainContainer>
        </Container>
      }
      disableRightChevron
      onClick={() => {
        onSelectOption?.(id);
      }}
      {...remainder}
    />
  );
}
