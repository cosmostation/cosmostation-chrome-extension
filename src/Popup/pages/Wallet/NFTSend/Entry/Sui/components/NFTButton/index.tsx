import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTObjectsSWR } from '~/Popup/hooks/SWR/sui/useNFTObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { convertIpfs } from '~/Popup/utils/nft';
import { shorterAddress } from '~/Popup/utils/string';
import { getNFTMeta } from '~/Popup/utils/sui';
import type { SuiChain } from '~/types/chain';

import {
  Button,
  LeftContainer,
  LeftImageContainer,
  LeftInfoBodyContainer,
  LeftInfoContainer,
  LeftInfoFooterContainer,
  LeftInfoHeaderContainer,
  RightContainer,
} from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

type NFTButtonProps = ComponentProps<typeof Button> & {
  isActive?: boolean;
  nftObjectId: string;
  chain: SuiChain;
};

export default function NFTButton({ nftObjectId, chain, isActive, ...remainder }: NFTButtonProps) {
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { nftObjects } = useNFTObjectsSWR({ network: currentSuiNetwork, address });

  const currentNFTObject = useMemo(() => nftObjects.find((object) => object.data?.objectId === nftObjectId), [nftObjects, nftObjectId]);
  const nftMeta = useMemo(() => getNFTMeta(currentNFTObject), [currentNFTObject]);

  const { imageURL, name, type, objectId } = nftMeta;

  const shorterObjectId = useMemo(() => shorterAddress(objectId, 23), [objectId]);
  const shorterObjectType = useMemo(() => shorterAddress(type, 23), [type]);

  return (
    <Button type="button" {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={convertIpfs(imageURL)} defaultImgSrc={unknownNFTImg} />
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={name || '-'} placement="top" arrow>
              <Typography variant="h5">{name || '-'}</Typography>
            </Tooltip>
          </LeftInfoHeaderContainer>
          <LeftInfoBodyContainer>
            <Tooltip title={objectId || ''} placement="top" arrow>
              <Typography variant="h6">{shorterObjectId}</Typography>
            </Tooltip>
          </LeftInfoBodyContainer>
          <LeftInfoFooterContainer>
            <Tooltip title={type || ''} placement="top" arrow>
              <Typography variant="h6">{shorterObjectType}</Typography>
            </Tooltip>
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer data-is-active={isActive ? 1 : 0}>
        <BottomArrow24Icon />
      </RightContainer>
    </Button>
  );
}
