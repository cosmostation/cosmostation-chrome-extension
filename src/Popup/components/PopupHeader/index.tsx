import stc from 'string-to-color';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import { shorterAddress } from '~/Popup/utils/string';

import { AccountContainer, AccountIcon, AccountText, ChainImageContainer, ChainNameContainer, Container, Div, OriginContainer, StyledDivider } from './styled';

import Account from '~/images/icons/Account10.svg';

type HeaderProps = {
  account?: {
    name: string;
    id: string;
    address?: string;
  };
  chain?: {
    name: string;
    imageURL?: string;
  };
  origin?: string;
  className?: string;
};

export default function Header({ account, chain, origin, className }: HeaderProps) {
  const shortAddress = shorterAddress(account?.address, 12) || '';

  return (
    <Container className={className}>
      {account && (
        <AccountContainer>
          <AccountIcon data-account-color={stc(account.id)}>
            <Account />
          </AccountIcon>
          <AccountText>
            <Typography variant="h6">{`${account.name} ${shortAddress && `(${shortAddress})`}`}</Typography>
          </AccountText>
        </AccountContainer>
      )}
      {account && chain && <StyledDivider />}
      {chain && (
        <ChainNameContainer>
          <ChainImageContainer>
            <Image src={chain.imageURL} />
          </ChainImageContainer>
          <Div sx={{ marginLeft: '0.4rem' }}>
            <Typography variant="h3">{chain.name}</Typography>
          </Div>
        </ChainNameContainer>
      )}
      {origin && (
        <OriginContainer sx={{ marginTop: account || chain ? '0.4rem' : 0 }}>
          <Typography variant="h6">{origin}</Typography>
        </OriginContainer>
      )}
    </Container>
  );
}
