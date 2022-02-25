import { Typography } from '@mui/material';

import cosmosImg from '~/images/symbols/cosmos.png';
import AddressButton from '~/Popup/components/AddressButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';

import {
  Container,
  FirstLineContainer,
  FirstLineLeftContainer,
  FirstLineRightContainer,
  FourthLineCenterContainer,
  FourthLineContainer,
  SecondLineContainer,
  SecondLineLeftContainer,
  SecondLineLeftImageContainer,
  SecondLineLeftTextContainer,
  SecondLineRightContainer,
  StyledIconButton,
  ThirdLineContainer,
} from './styled';

import ExplorerIcon from '~/images/icons/Explorer.svg';
import ReceiveIcon from '~/images/icons/Receive.svg';
import SendIcon from '~/images/icons/Send.svg';

export default function NativeChainCard() {
  const { chromeStorage } = useChromeStorage();
  return (
    <Container>
      <FirstLineContainer>
        <FirstLineLeftContainer>
          <AddressButton>cosmos1gr0e3pj3y6fqvzyfm0qxyw9h5dwfrvh8zv3x9p</AddressButton>
        </FirstLineLeftContainer>
        <FirstLineRightContainer>
          <StyledIconButton>
            <ExplorerIcon />
          </StyledIconButton>
        </FirstLineRightContainer>
      </FirstLineContainer>
      <SecondLineContainer>
        <SecondLineLeftContainer>
          <SecondLineLeftImageContainer>
            <Image src={cosmosImg} />
          </SecondLineLeftImageContainer>
          <SecondLineLeftTextContainer>
            <Typography variant="h3">ATOM</Typography>
          </SecondLineLeftTextContainer>
        </SecondLineLeftContainer>
        <SecondLineRightContainer>
          <Number>1090.000069</Number>
        </SecondLineRightContainer>
      </SecondLineContainer>
      <ThirdLineContainer>
        <Number typoOfIntegers="h3n" typoOfDecimals="h5n" fixed={2} currency={chromeStorage.currency}>
          75.4000
        </Number>
      </ThirdLineContainer>
      <FourthLineContainer>
        <Button Icon={SendIcon} typoVarient="h5">
          Send
        </Button>
        <FourthLineCenterContainer />
        <Button Icon={ReceiveIcon} typoVarient="h5">
          Receive
        </Button>
      </FourthLineContainer>
    </Container>
  );
}
