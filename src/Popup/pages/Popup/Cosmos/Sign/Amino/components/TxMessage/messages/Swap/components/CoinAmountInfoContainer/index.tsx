import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';

import { CoinContainer, CoinImageContainer, CoinInfoContainer, CoinSubTitleContainer, CoinTitleContainer } from './styled';

type CoinAmountInfoContainerProps = {
  coinImg?: string;
  displayDenom?: string;
  displayAmount: string;
  isTilde?: boolean;
};

export default function CoinAmountInfoContainer({ coinImg, displayDenom, displayAmount, isTilde }: CoinAmountInfoContainerProps) {
  return (
    <CoinContainer>
      <CoinImageContainer>
        <Image src={coinImg} />
      </CoinImageContainer>
      <CoinInfoContainer>
        <CoinTitleContainer>
          <Typography variant="h4">{displayDenom}</Typography>
        </CoinTitleContainer>
        <CoinSubTitleContainer>
          <Tooltip title={displayAmount} arrow placement="top">
            <span>
              <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
                {`${isTilde ? `≈` : ``} ${displayAmount}`}
              </Number>
            </span>
          </Tooltip>
        </CoinSubTitleContainer>
      </CoinInfoContainer>
    </CoinContainer>
  );
}
