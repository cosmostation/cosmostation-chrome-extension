import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';

import {
  AddressText,
  AddressTextContainer,
  Badge,
  ButtonBodyContainer,
  ButtonBottomContainer,
  ButtonWrapper,
  ChainImage,
  CoinTypeNameContainer,
  CoinTypeNameTextContainer,
  Container,
  DefaultText,
  HdPathText,
  HdPathTextContainer,
  OutlinedButton,
  TopContainer,
  ValueContainer,
} from './styled';

export default function CoinTypeSelector() {
  const { t } = useTranslation();
  const isBitcoin = true;

  // NOTE should be get from props
  const chainName = 'Bitcoin';
  const selectedHdPath = "m/84'/0'/0'/0/0";
  const currentAccountIndex = 0;

  const dummyData = [
    {
      address: 'bc1a17d2wax0zhjrrecvaszuyxdf5wcu5a0p4qlx12z',
      typeName: 'Native Segwit',
      // TODO ${index} 앞서 설정한 어카운트의 hdPath index값 가져와서 치환해줘야함.
      hdPath: "m/84'/0'/0'/0/${index}",
      recommended: true,
      value: '900',
    },
    {
      address: '3KEVTN17d2wax0zhjrrecvaszuyxdf5wcu5a0p4qlx1s6',
      typeName: 'NASTED SEGWIT',
      hdPath: 'm/44’/0’/0’/0/${index}',
      value: '900',
    },
    {
      address: '13TVLKd2wax0zhjrrecvaszuyxdf5wcu5a0p4qlxs4x',
      typeName: 'LEGACY',
      hdPath: 'm/49’/0’/0’/0/${index}',
      value: '300',
    },
  ].map((item) => ({
    ...item,
    hdPath: item.hdPath.replace('${index}', currentAccountIndex.toString()),
  }));

  return (
    <Container>
      <TopContainer>
        <ChainImage src={'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/sui/asset/sui.png'} />
        <Base1300Text variant="h3_B">
          {t('pages.account.restore-wallet.coin-type-setting.components.CoinTypeSelector.index.coinType').replace('${chain}', chainName)}
        </Base1300Text>
      </TopContainer>
      <ButtonWrapper>
        {dummyData.map((item) => {
          const isSelected = selectedHdPath.replace(/\s+/g, '') === item.hdPath.replace(/\s+/g, '');

          const [rootLevel, purposeLevel, coinTypeLevel, accountLevel, changeLevel, indexLevel] = item.hdPath.split('/');

          const highlightedLeftText = `${rootLevel} / ${isBitcoin ? '' : `${purposeLevel} / `}`;
          const highlightedText = isBitcoin ? purposeLevel : coinTypeLevel;
          const highlightedRightText = ` / ${isBitcoin ? `${coinTypeLevel} / ` : ''}${accountLevel} / ${changeLevel} / ${indexLevel}`;
          return (
            <OutlinedButton key={item.address} isSelected={isSelected}>
              <ButtonBodyContainer>
                <CoinTypeNameContainer>
                  <CoinTypeNameTextContainer>
                    <Base1300Text variant="b2_M">{item.typeName}</Base1300Text>
                    &nbsp;
                    {item.recommended && <DefaultText variant="b2_M">{'(Default)'}</DefaultText>}
                  </CoinTypeNameTextContainer>

                  {item.recommended && (
                    <Badge>
                      <Base1300Text>{'RECOMMENDED'}</Base1300Text>
                    </Badge>
                  )}
                </CoinTypeNameContainer>
                <AddressTextContainer>
                  <AddressText variant="b4_R">{item.address}</AddressText>
                </AddressTextContainer>
              </ButtonBodyContainer>
              <ButtonBottomContainer>
                <HdPathTextContainer>
                  <HdPathText variant="h6n_M">{highlightedLeftText}</HdPathText>
                  &nbsp;
                  <Base1300Text variant="h6n_M">{highlightedText}</Base1300Text>
                  &nbsp;
                  <HdPathText variant="h6n_M">{highlightedRightText}</HdPathText>
                </HdPathTextContainer>

                <ValueContainer>
                  <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency="usd">
                    {item.value}
                  </NumberTypo>
                </ValueContainer>
              </ButtonBottomContainer>
            </OutlinedButton>
          );
        })}
      </ButtonWrapper>
    </Container>
  );
}
