import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';

import { CoinContainer, CoinImageContainer, CoinInfoContainer, CoinSubTitleContainer, CoinTitleContainer } from './styled';

type CoinAmountInfoContainerProps = {
  displayAmount: string;
  coinImg?: string;
  displayDenom?: string;
  isTilde?: boolean;
};

export default function CoinAmountInfoContainer({ coinImg, displayDenom, displayAmount, isTilde }: CoinAmountInfoContainerProps) {
  const coinDisplayDenom = displayDenom || 'Unknown';

  return (
    <CoinContainer>
      <CoinImageContainer>
        <Image src={coinImg} />
      </CoinImageContainer>
      <CoinInfoContainer>
        <CoinTitleContainer>
          <Tooltip title={coinDisplayDenom} arrow placement="top">
            <Typography variant="h4">{coinDisplayDenom}</Typography>
          </Tooltip>
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
