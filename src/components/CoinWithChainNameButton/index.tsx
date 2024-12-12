import { ChainNameTypography, ContentsContainer, SymbolTypography } from './styled';
import type { BaseCoinButtonProps } from '../common/BaseCoinButton';
import BaseCoinButton from '../common/BaseCoinButton';
import type { BaseCoinImageProps } from '../common/BaseCoinImage';
import BaseCoinImage from '../common/BaseCoinImage';

type CoinWithChainNameButtonProps = BaseCoinButtonProps & {
  chainName?: string;
  assetId?: string;
  coinImageProps: BaseCoinImageProps;
  displayAssetId?: boolean;
};

export default function CoinWithChainNameButton({
  symbol,
  chainName,
  assetId,
  displayAssetId = false,
  coinImageProps,
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
            <SymbolTypography variant="b2_M">{resolvedSymbol}</SymbolTypography>
            <ChainNameTypography variant="b4_R">{displayAssetId ? resolvedAssetId : resolvedChainName}</ChainNameTypography>
          </ContentsContainer>
        </>
      }
      {...remainder}
    />
  );
}
