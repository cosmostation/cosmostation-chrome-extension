import { useMemo, useState } from 'react';

import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { isEqualsIgnoringCase } from '@/utils/string';

import { ChangeAddressIconButtonContainer, Container, IconDivider } from './styled';
import IconButton from '../common/IconButton';
import type { ShortAddressCopyButtonProps } from '../ShortAddressCopyButton';
import ShortAddressCopyButton from '../ShortAddressCopyButton';

import ChangeIcon from '@/assets/images/icons/ChangeGrey14.svg';
import ChromeIcon from '@/assets/images/icons/Chrome16.svg';

type AddressActionButtonsProps = Omit<ShortAddressCopyButtonProps, 'children'> & {
  coinId: string;
};

export default function AddressActionButtons({ coinId, ...remainder }: AddressActionButtonsProps) {
  const [isShowCosmosStyleAddress, setIsShowCosmosStyleAddress] = useState(false);

  const { getAccountAsset } = useGetAccountAsset({ coinId });

  const { data: currentAccountAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const currentCoin = getAccountAsset();

  const cosmosStyleCoin = useMemo(() => {
    const isEthermint = currentCoin?.chain.chainType === 'evm' && currentCoin.chain.isCosmos;

    const isMainCoin = isEqualsIgnoringCase(currentCoin?.asset.id, NATIVE_EVM_COIN_ADDRESS);

    if (isEthermint && isMainCoin) {
      return currentAccountAssets?.cosmosAccountAssets.find(
        (item) =>
          item.asset.id === currentCoin.chain.mainAssetDenom &&
          item.chain.id === currentCoin.chain.id &&
          item.address.chainId === currentCoin.address.chainId &&
          item.address.accountType.hdPath === currentCoin.address.accountType.hdPath,
      );
    }

    return undefined;
  }, [currentAccountAssets?.cosmosAccountAssets, currentCoin]);

  const address = isShowCosmosStyleAddress ? cosmosStyleCoin?.address.address || '' : currentCoin?.address.address || '';

  const explorerUrl = (() => {
    const coin = isShowCosmosStyleAddress ? cosmosStyleCoin : currentCoin;

    return coin?.chain.explorer?.account && coin?.address?.address ? coin.chain.explorer.account.replace('${address}', coin.address.address) : undefined;
  })();

  const handleOnClickChangeAddress = () => {
    setIsShowCosmosStyleAddress(!isShowCosmosStyleAddress);
  };

  return (
    <Container>
      <ShortAddressCopyButton {...remainder}>{address}</ShortAddressCopyButton>
      {cosmosStyleCoin && (
        <ChangeAddressIconButtonContainer>
          <IconButton onClick={handleOnClickChangeAddress}>
            <ChangeIcon />
          </IconButton>
        </ChangeAddressIconButtonContainer>
      )}
      <IconDivider />
      <ChangeAddressIconButtonContainer>
        <IconButton disabled={!explorerUrl} onClick={() => explorerUrl && window.open(explorerUrl, '_blank')}>
          <ChromeIcon />
        </IconButton>
      </ChangeAddressIconButtonContainer>
    </Container>
  );
}
