import { Typography } from '@mui/material';

import Tooltip from '~/Popup/components/common/Tooltip';
import { shorterAddress } from '~/Popup/utils/string';
import type { Chain } from '~/types/chain';

import { AddressContainer, Container, LabelContainer, LabelLeftContainer, StyledImage } from './styled';

type AccountAddressBookItemProps = {
  accountName: string;
  chain?: Chain;
  address: string;
  onClick?: (address: string) => void;
};

export default function AccountAddressBookItem({ onClick, address, chain, accountName }: AccountAddressBookItemProps) {
  return (
    <Container onClick={() => onClick?.(address)} data-is-onclick={onClick ? 1 : 0}>
      <LabelContainer>
        <LabelLeftContainer>
          <StyledImage src={chain?.imageURL} />
          <Typography variant="h6">{accountName}</Typography>
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
