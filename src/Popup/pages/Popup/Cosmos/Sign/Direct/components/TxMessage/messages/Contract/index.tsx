import { useMemo } from 'react';
import YAML from 'js-yaml';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAssetsSWR as useCosmosAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Msg, MsgExecuteContract } from '~/types/cosmos/proto';

import {
  AddressContainer,
  AmountInfoContainer,
  ContentContainer,
  DenomContainer,
  LabelContainer,
  LeftContainer,
  RightAmountContainer,
  RightColumnContainer,
  RightContainer,
  RightValueContainer,
  ValueContainer,
} from './styled';
import Container from '../../components/Container';

type ContractProps = { msg: Msg<MsgExecuteContract>; chain: CosmosChain; isMultipleMsgs: boolean };

export default function Contract({ msg, chain, isMultipleMsgs }: ContractProps) {
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const cosmosAssets = useCosmosAssetsSWR(chain);

  const { t } = useTranslation();

  const { currency } = extensionStorage;

  const { value } = msg;

  const { sender, funds, contract, msg: contractMsg } = value;

  const msgData = useMemo(() => YAML.dump({ contractMsg }, { indent: 4 }), [contractMsg]);

  const displayFunds = useMemo(
    () =>
      funds.map((item) => {
        const token = cosmosAssets.data.find((asset) => asset.denom === item.denom);
        const chainPrice = (token?.coinGeckoId && coinGeckoPrice.data?.[token.coinGeckoId]?.[currency]) || 0;
        const displayDenomAmount = toDisplayDenomAmount(item.amount, cosmosAssets.data.find((asset) => asset.denom === item.denom)?.decimals || 0);
        const displayValue = times(displayDenomAmount, chainPrice);

        return {
          denom: item.denom,
          displayDenomAmount,
          displayValue,
        };
      }),
    [funds, cosmosAssets.data, coinGeckoPrice.data, currency],
  );

  return (
    <Container title="Execute Contract" isMultipleMsgs={isMultipleMsgs}>
      <ContentContainer>
        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Contract.index.sender')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(sender, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        <AddressContainer sx={{ marginTop: '0.4rem' }}>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Contract.index.contract')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{shorterAddress(contract, 32)}</Typography>
          </ValueContainer>
        </AddressContainer>

        {displayFunds &&
          displayFunds.map((item) => (
            <AmountInfoContainer key={`${item.denom}-${item.displayDenomAmount}`}>
              <LeftContainer>
                <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Contract.index.funds')}</Typography>
              </LeftContainer>
              <RightContainer>
                <RightColumnContainer>
                  <RightAmountContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                      {item.displayDenomAmount}
                    </Number>
                    &nbsp;
                    <DenomContainer>
                      <Tooltip title={item.denom} arrow placement="top">
                        <Typography variant="h5n">{item.denom}</Typography>
                      </Tooltip>
                    </DenomContainer>
                  </RightAmountContainer>
                  <RightValueContainer>
                    <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                      {item.displayValue}
                    </Number>
                  </RightValueContainer>
                </RightColumnContainer>
              </RightContainer>
            </AmountInfoContainer>
          ))}

        <AddressContainer>
          <LabelContainer>
            <Typography variant="h5">{t('pages.Popup.Cosmos.Sign.Amino.components.TxMessage.messages.Contract.index.msg')}</Typography>
          </LabelContainer>
          <ValueContainer>
            <Typography variant="h5">{msgData}</Typography>
          </ValueContainer>
        </AddressContainer>
      </ContentContainer>
    </Container>
  );
}
