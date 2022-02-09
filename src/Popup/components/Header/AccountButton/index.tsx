import { Badge, StyledButton } from './styled';

import Account from '~/images/icons/Account.svg';

type AccountButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  isConnected?: boolean;
};

export default function AccountButton({ isConnected = false, ...remainder }: AccountButtonProps) {
  return (
    <StyledButton {...remainder}>
      <Account />
      <Badge is_connected={isConnected ? 1 : 0} />
    </StyledButton>
  );
}
