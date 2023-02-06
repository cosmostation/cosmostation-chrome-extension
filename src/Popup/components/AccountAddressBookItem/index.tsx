import stc from 'string-to-color';
import { Typography } from '@mui/material';

import Tooltip from '~/Popup/components/common/Tooltip';
import { shorterAddress } from '~/Popup/utils/string';

import { AccountIconContainer, AddressContainer, Container, LabelContainer, LabelLeftContainer } from './styled';

import Account10Icon from '~/images/icons/Account10.svg';

type AccountAddressBookItemProps = {
  accountName: string;
  address: string;
  accountId: string;
  onClick?: (address: string) => void;
};

export default function AccountAddressBookItem({ onClick, address, accountName, accountId }: AccountAddressBookItemProps) {
  const accountColor = stc(accountId);

  return (
    <Container onClick={() => onClick?.(address)} data-is-onclick={onClick ? 1 : 0}>
      <LabelContainer>
        <LabelLeftContainer>
          <AccountIconContainer data-account-color={accountColor}>
            <Account10Icon />
          </AccountIconContainer>
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
