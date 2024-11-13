import { ChainNameTypography, ContentsContainer, SymbolTypography } from './styled';
import type { BaseCoinButtonProps } from '../BaseCoinButton';
import BaseCoinButton from '../BaseCoinButton';
import type { BaseCoinImageProps } from '../BaseCoinButton/components/BaseCoinImage';
import BaseCoinImage from '../BaseCoinButton/components/BaseCoinImage';

type CoinWithChainNameButtonProps = BaseCoinButtonProps & {
  chainName?: string;
  coinImageProps: BaseCoinImageProps;
};

export default function CoinWithChainNameButton({ symbol, chainName, coinImageProps, ...remainder }: CoinWithChainNameButtonProps) {
  const resolvedSymbol = symbol || 'UNKNOWN';
  const resolvedChainName = chainName || 'UNKNOWN';

  return (
    <BaseCoinButton
      leftComponent={
        <>
          <BaseCoinImage {...coinImageProps} />
          <ContentsContainer>
            <SymbolTypography variant="b2_M">{resolvedSymbol}</SymbolTypography>
            <ChainNameTypography variant="b4_R">{resolvedChainName}</ChainNameTypography>
          </ContentsContainer>
        </>
      }
      {...remainder}
    />
  );
}
