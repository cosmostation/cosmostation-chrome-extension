import { useState } from 'react';
import { Typography } from '@mui/material';

import { CHAINS } from '~/constants/chain';
import Tooltip from '~/Popup/components/common/Tooltip';
import { shorterAddress } from '~/Popup/utils/string';
import type { AddressInfo } from '~/types/chromeStorage';

import ManagePopover from './ManagePopover';
import { AddressContainer, Container, LabelContainer, LabelLeftContainer, LabelRightContainer, MemoContainer, StyledButton, StyledImage } from './styled';

import Add24Icon from '~/images/icons/Add24.svg';

type AddressBookItemProps = {
  addressInfo: AddressInfo;
  onClick?: (addressInfo: AddressInfo) => void;
};

export default function AddressBookItem({ addressInfo, onClick }: AddressBookItemProps) {
  const { address, memo, label, chainId } = addressInfo;

  const chain = CHAINS.find((item) => item.id === chainId);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  return (
    <Container onClick={() => onClick?.(addressInfo)} data-is-onclick={onClick ? 1 : 0}>
      <LabelContainer>
        <LabelLeftContainer>
          <StyledImage src={chain?.imageURL} />
          <Typography variant="h6">{label}</Typography>
        </LabelLeftContainer>
        <LabelRightContainer>
          <StyledButton
            data-is-active={isOpenPopover ? 1 : 0}
            onClick={(event) => {
              event.stopPropagation();
              setPopoverAnchorEl(event.currentTarget);
            }}
          >
            <Add24Icon />
          </StyledButton>
        </LabelRightContainer>
      </LabelContainer>
      <AddressContainer>
        <Tooltip title={address} placement="top" arrow>
          <Typography variant="h6">{shorterAddress(address, 30)}</Typography>
        </Tooltip>
      </AddressContainer>
      {memo && (
        <MemoContainer>
          <Typography variant="h6">{memo}</Typography>
        </MemoContainer>
      )}

      <ManagePopover
        addressInfo={addressInfo}
        marginThreshold={0}
        open={isOpenPopover}
        onClose={() => {
          setPopoverAnchorEl(null);
        }}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />
    </Container>
  );
}
