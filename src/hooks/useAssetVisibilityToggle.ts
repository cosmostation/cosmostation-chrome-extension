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
  isLastVisible: boolean;
};

export function useAssetVisibilityToggle({ isLastVisible }: UseAssetVisibilityToggleParams) {
  const { t } = useTranslation();

  const { hideAsset, showAsset } = useCurrentHiddenAssetIds();
  const { removeVisibleAsset, addVisibleAsset } = useCurrentVisibleAssetIds();
  const { hideCustomAsset, showCustomAsset } = useCustomAssets();
  const { removeCustomERC20Token } = useCurrentCustomERC20Tokens();
  const { removeCustomCW20Token } = useCurrentCustomCW20Tokens();
  const [tokenToDelete, setTokenToDelete] = useState<ProcessedAsset | undefined>();

  const handleAssetVisibility = useCallback(
    async (asset: ProcessedAsset) => {
      if (asset.isHiddenState) {
        await (asset.innerTokenType === 'custom-asset' ? showCustomAsset : showAsset)(asset.uniqueCoinId);
        if (asset.isBalanceZero) await addVisibleAsset(asset.uniqueCoinId);
        return;
      }

      if (isLastVisible) return toastError(t('pages.manage-assets.visibility.assets.entry.lastStandingError'));
      await removeVisibleAsset(asset.uniqueCoinId);
      if (!asset.isBalanceZero) await (asset.innerTokenType === 'custom-asset' ? hideCustomAsset : hideAsset)(asset.uniqueCoinId);
    },
    [addVisibleAsset, hideAsset, hideCustomAsset, isLastVisible, removeVisibleAsset, showAsset, showCustomAsset, t],
  );

  const handleToggleVisibility = useCallback(
    async (coin: ProcessedAsset) => {
      if (coin.innerTokenType === 'custom-cw20' || coin.innerTokenType === 'custom-erc20') {
        setTokenToDelete(coin);
      } else {
        await handleAssetVisibility(coin);
      }
    },
    [handleAssetVisibility],
  );

  const confirmDeleteAndHide = useCallback(async () => {
    try {
      if (tokenToDelete?.asset) {
        const uniqueCoinId = tokenToDelete.uniqueCoinId || getUniqueCoinId(tokenToDelete.asset);

        if (tokenToDelete.asset.type === 'cw20') await removeCustomCW20Token(uniqueCoinId);
        else if (tokenToDelete.asset.type === 'erc20') await removeCustomERC20Token(uniqueCoinId);
      }
    } finally {
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
