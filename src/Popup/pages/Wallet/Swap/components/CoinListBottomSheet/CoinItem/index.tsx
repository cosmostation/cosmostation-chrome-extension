import { useRef } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import type { CoinInfo as BaseCoinInfo } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';

import {
  ChainButton,
  ChainLeftChainNameContainer,
  ChainLeftChannelIdContainer,
  ChainLeftContainer,
  ChainLeftImageContainer,
  ChainLeftInfoContainer,
  ChainRightContainer,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

type CoinItemProps = {
  coinInfo: BaseCoinInfo;
  onClickCoin?: (clickedCoin: BaseCoinInfo) => void;
  isActive: boolean;
};

export default function CoinItem({ coinInfo, onClickCoin, isActive }: CoinItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  //   useEffect(() => {
  //     if (remainder.open) {
  //       setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  //     }
  //   }, [remainder.open]);

  return (
    <ChainButton
      type="button"
      key={coinInfo.baseDenom}
      data-is-active={isActive ? 1 : 0}
      ref={isActive ? ref : undefined}
      onClick={() => {
        onClickCoin?.(coinInfo);
      }}
    >
      <ChainLeftContainer>
        <ChainLeftImageContainer>
          <Image src={coinInfo.imageURL} />
        </ChainLeftImageContainer>
        <ChainLeftInfoContainer>
          <ChainLeftChainNameContainer>
            <Typography variant="h5">{coinInfo.displayDenom}</Typography>
          </ChainLeftChainNameContainer>
          <ChainLeftChannelIdContainer>
            <Typography variant="h6n">{coinInfo.availableAmount}</Typography>
          </ChainLeftChannelIdContainer>
        </ChainLeftInfoContainer>
      </ChainLeftContainer>
      <ChainRightContainer>{isActive && <Check16Icon />}</ChainRightContainer>
    </ChainButton>
  );
}
