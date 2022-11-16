import { Typography } from '@mui/material';

import { CHAINS } from '~/constants/chain';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { shorterAddress } from '~/Popup/utils/string';

import { AddressContainer, Container, LabelContainer, LabelLeftContainer, StyledImage } from './styled';

type MyAddressBookItemProps = {
  chainId: string;
  address: string;
  onClick?: (addressInfo: string) => void;
};

export default function MyAddressBookItem({ onClick, address, chainId }: MyAddressBookItemProps) {
  const { currentAccount } = useCurrentAccount();

  const chain = CHAINS.find((item) => item.id === chainId);

  return (
    <Container onClick={() => onClick?.(address)} data-is-onclick={onClick ? 1 : 0}>
      <LabelContainer>
        <LabelLeftContainer>
          <StyledImage src={chain?.imageURL} />
          <Typography variant="h6">{currentAccount.name}</Typography>
        </LabelLeftContainer>
      </LabelContainer>
      <AddressContainer>
        <Tooltip title={address} placement="top" arrow>
          <Typography variant="h6">{shorterAddress(address, 30)}</Typography>
        </Tooltip>
      </AddressContainer>
    </Container>
  );
}
