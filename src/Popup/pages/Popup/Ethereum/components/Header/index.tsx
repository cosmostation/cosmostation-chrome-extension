import stc from 'string-to-color';
import { Typography } from '@mui/material';

import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { getAddress, getKeyPair, shorterAddress } from '~/Popup/utils/common';
import type { EthereumChain, EthereumNetwork } from '~/types/chain';

import { AccountContainer, AccountIcon, AccountText, ChainNameContainer, Container, OriginContainer, StyledDivider } from './styled';

import Account from '~/images/icons/Account10.svg';

type HeaderProps = {
  chain: EthereumChain;
  network?: EthereumNetwork;
  origin?: string;
  className?: string;
};

export default function Header({ chain, network, origin, className }: HeaderProps) {
  const { currentAccount } = useCurrentAccount();

  const { currentPassword } = useCurrentPassword();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const shortAddress = shorterAddress(address, 12) || '';

  const chainName = network ? `${chain.chainName} ${network.networkName}` : chain.chainName;

  const accountColor = stc(currentAccount.id);
  return (
    <Container className={className}>
      <AccountContainer>
        <AccountIcon data-account-color={accountColor}>
          <Account />
        </AccountIcon>
        <AccountText>
          <Typography variant="h6">{`${currentAccount.name} (${shortAddress})`}</Typography>
        </AccountText>
      </AccountContainer>
      <StyledDivider />
      <ChainNameContainer>
        <Typography variant="h3">{chainName}</Typography>
      </ChainNameContainer>
      {origin && (
        <OriginContainer>
          <Typography variant="h6">{origin}</Typography>
        </OriginContainer>
      )}
    </Container>
  );
}
