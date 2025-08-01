import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinSelect from '@/components/CoinSelect';
import EthermintSendBottomSheet from '@/components/EthermintSendBottomSheet';
import { Route as Send } from '@/pages/wallet/send/$coinId';
import type { AccountCosmosAsset } from '@/types/account';
import { getCoinId } from '@/utils/queryParamGenerator';

export default function Entry() {
  const navigate = useNavigate();

  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);

  const [selectedEVMCoinId, setSelectedEVMCoinId] = useState('');
  const [selectedCosmosCoinId, setSelectedCosmosCoinId] = useState('');

  const [selectedCoinAccountPrefix, setSelectedCoinAccountPrefix] = useState('');

  const handleOnClickCoin = useCallback(
    (coinId: string, ethermintCoin?: AccountCosmosAsset) => {
      if (ethermintCoin) {
        setSelectedEVMCoinId(coinId);
        setSelectedCosmosCoinId(getCoinId(ethermintCoin.asset));

        setSelectedCoinAccountPrefix(ethermintCoin.chain.accountPrefix + 1);
        setIsOpenBottomSheet(true);
      } else {
        navigate({
          to: Send.to,
          params: {
            coinId,
          },
        });
      }
    },
    [navigate],
  );

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
      <EdgeAligner
        style={{
          flex: '1',
        }}
      >
        <CoinSelect onSelectCoin={handleOnClickCoin} />
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
