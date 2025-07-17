import Typography from '@mui/material/Typography';

import { gt } from '@/utils/numbers';

import { APRText, APRTextContainer, ChainNameContainer, ChainNameTypography, ContentsContainer, SymbolContainer, SymbolTypography } from './styled';
import BalanceSyncStatusIcon from '../BalanceSyncStatusIcon';
import Base1000Text from '../common/Base1000Text';
import type { BaseCoinButtonProps } from '../common/BaseCoinButton';
import BaseCoinButton from '../common/BaseCoinButton';
import type { BaseCoinImageProps } from '../common/BaseCoinImage';
import BaseCoinImage from '../common/BaseCoinImage';
import NumberTypo from '../common/NumberTypo';

type CoinWithChainNameButtonProps = BaseCoinButtonProps & {
  chainName?: string;
  assetId?: string;
  coinImageProps: BaseCoinImageProps;
  displayAssetId?: boolean;
  apr?: string;
};

export default function CoinWithChainNameButton({
  symbol,
  chainName,
  assetId,
  displayAssetId = false,
  coinImageProps,
  apr,
  ...remainder
}: CoinWithChainNameButtonProps) {
  const resolvedSymbol = symbol || 'UNKNOWN';
  const resolvedChainName = chainName || 'UNKNOWN';
  const resolvedAssetId = assetId || 'UNKNOWN';

  return (
    <BaseCoinButton
      leftComponent={
        <>
          <BaseCoinImage {...coinImageProps} />
          <ContentsContainer>
            <SymbolContainer>
              <SymbolTypography variant="b2_M">{resolvedSymbol}</SymbolTypography>
              <BalanceSyncStatusIcon lastUpdatedAtMs={remainder.lastUpdatedAtMs} />
            </SymbolContainer>
            {apr ? (
              <APRTextContainer>
                <Base1000Text variant="b4_R">{`APR : `}</Base1000Text>
                &nbsp;
                <APRText data-is-high-apr={gt(apr, '14')}>
                  {gt(apr, '0') ? (
                    <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={2}>
                      {apr}
                    </NumberTypo>
                  ) : (
                    <Base1000Text variant="h6n_M">{`-`}</Base1000Text>
                  )}
                  &nbsp;
                  <Typography variant="h8n_R">{`%`}</Typography>
                </APRText>
              </APRTextContainer>
            ) : (
              <ChainNameContainer>
                <ChainNameTypography variant="b4_R">{displayAssetId ? resolvedAssetId : resolvedChainName}</ChainNameTypography>
              </ChainNameContainer>
            )}
          </ContentsContainer>
        </>
      }
      {...remainder}
    />
  );
}
