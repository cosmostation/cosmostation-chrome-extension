import { useNavigate } from '@tanstack/react-router';

import IconTextButton from '@/components/common/IconTextButton';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as SwithAccount } from '@/pages/manage-account/switch-account';

import { AccountText, IconContainer } from './styled';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

export default function AccountButton() {
  const navigate = useNavigate();
  const { currentAccount } = useCurrentAccount();

  return (
    <IconTextButton
      onClick={() => {
        navigate({
          to: SwithAccount.to,
        });
      }}
      trailingIcon={
        <IconContainer>
          <BottomFilledChevronIcon />
        </IconContainer>
      }
    >
      <AccountText variant="h4_B">{currentAccount.name}</AccountText>
    </IconTextButton>
  );
}
