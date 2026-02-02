import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getUniqueCoinId } from '@/utils/queryParamGenerator';
import { toastError } from '@/utils/toast';

import { useCurrentCustomCW20Tokens } from './useCurrentCustomCW20Tokens';
import { useCurrentCustomERC20Tokens } from './useCurrentCustomERC20Tokens';
import { useCurrentHiddenAssetIds } from './useCurrentHiddenAssetIds';
import { useCurrentVisibleAssetIds } from './useCurrentVisibleAssetIds';
import { useCustomAssets } from './useCustomAssets';
import type { ProcessedAsset } from './useProcessedAssets';

type UseAssetVisibilityToggleParams = {
  visibleCount: number;
};

export function useAssetVisibilityToggle({ visibleCount }: UseAssetVisibilityToggleParams) {
  const { t } = useTranslation();

  const { hideAsset, showAsset } = useCurrentHiddenAssetIds();
  const { removeVisibleAsset, addVisibleAsset } = useCurrentVisibleAssetIds();
  const { hideCustomAsset, showCustomAsset } = useCustomAssets();
  const { removeCustomERC20Token } = useCurrentCustomERC20Tokens();
  const { removeCustomCW20Token } = useCurrentCustomCW20Tokens();
  const [tokenToDelete, setTokenToDelete] = useState<ProcessedAsset | undefined>();

  const isLastStanding = visibleCount === 1;

  const handleAssetVisibility = useCallback(
    async (asset: ProcessedAsset) => {
      if (asset.isHiddenState) {
        await (asset.innerTokenType === 'custom-asset' ? showCustomAsset : showAsset)(asset.uniqueCoinId);
        if (asset.isBalanceZero) await addVisibleAsset(asset.uniqueCoinId);
        return;
      }

      if (isLastStanding) return toastError(t('pages.manage-assets.visibility.assets.entry.lastStandingError'));
      if (!asset.isHiddenState) await removeVisibleAsset(asset.uniqueCoinId);
      if (!asset.isBalanceZero) await (asset.innerTokenType === 'custom-asset' ? hideCustomAsset : hideAsset)(asset.uniqueCoinId);
    },
    [addVisibleAsset, hideAsset, hideCustomAsset, isLastStanding, removeVisibleAsset, showAsset, showCustomAsset, t],
  );

  const handleToggleVisibility = useCallback(
    async (coin: ProcessedAsset) => {
      if (coin.isCustomToken) {
        setTokenToDelete(coin);
      } else {
        await handleAssetVisibility(coin);
      }
    },
    [handleAssetVisibility],
  );

  const confirmDeleteAndHide = useCallback(() => {
    if (tokenToDelete?.asset) {
      const uniqueCoinId = tokenToDelete?.uniqueCoinId || getUniqueCoinId(tokenToDelete.asset);

      if (tokenToDelete.asset.type === 'cw20') return removeCustomCW20Token(uniqueCoinId);
      if (tokenToDelete.asset.type === 'erc20') return removeCustomERC20Token(uniqueCoinId);

      setTokenToDelete(undefined);
    }
  }, [removeCustomCW20Token, removeCustomERC20Token, tokenToDelete?.asset, tokenToDelete?.uniqueCoinId]);

  const deleteConfirmState = useMemo(
    () => ({
      token: tokenToDelete,
      isOpen: !!tokenToDelete?.asset,
      onClose: () => setTokenToDelete(undefined),
      onConfirm: confirmDeleteAndHide,
    }),
    [tokenToDelete, confirmDeleteAndHide],
  );

  return {
    handleToggleVisibility,
    deleteConfirmState,
  };
}
