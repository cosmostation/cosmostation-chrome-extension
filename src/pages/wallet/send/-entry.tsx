import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinSelect from '@/components/CoinSelect';
import EthermintSendBottomSheet from '@/components/EthermintSendBottomSheet';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { Route as Send } from '@/pages/wallet/send/$coinId';
import { getCoinId, isMatchingCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';

export default function Entry() {
  const navigate = useNavigate();

  const { data: currentAccountAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);

  const [selectedEVMCoinId, setSelectedEVMCoinId] = useState('');
  const [selectedCosmosCoinId, setSelectedCosmosCoinId] = useState('');

  const [selectedCoinAccountPrefix, setSelectedCoinAccountPrefix] = useState('');

  const hanldeOnEthermintSend = useCallback(
    (val: 'cosmos' | 'evm') => {
      if (val === 'cosmos') {
        if (selectedCosmosCoinId) {
          navigate({
            to: Send.to,
            params: { coinId: selectedCosmosCoinId },
          });
        }
      } else if (selectedEVMCoinId) {
        navigate({
          to: Send.to,
          params: { coinId: selectedEVMCoinId },
        });
      }
    },
    [navigate, selectedCosmosCoinId, selectedEVMCoinId],
  );

  return (
    <BaseBody>
      <EdgeAligner>
        <CoinSelect
          onSelectCoin={(coinId) => {
            const currentCoin = currentAccountAssets?.flatAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));

            const cosmosStyleEthermintCoin = (() => {
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
            })();

            if (cosmosStyleEthermintCoin) {
              setSelectedEVMCoinId(coinId);
              setSelectedCosmosCoinId(getCoinId(cosmosStyleEthermintCoin.asset));

              setSelectedCoinAccountPrefix(cosmosStyleEthermintCoin.chain.accountPrefix + 1);
              setIsOpenBottomSheet(true);
            } else {
              navigate({
                to: Send.to,
                params: {
                  coinId,
                },
              });
            }
          }}
        />
      </EdgeAligner>
      <EthermintSendBottomSheet
        open={isOpenBottomSheet}
        onClose={() => setIsOpenBottomSheet(false)}
        bech32AddressPrefix={selectedCoinAccountPrefix}
        onSelectOption={hanldeOnEthermintSend}
      />
    </BaseBody>
  );
}
