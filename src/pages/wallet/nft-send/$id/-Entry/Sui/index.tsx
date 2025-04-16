import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction, type Transaction as TransactionType } from '@mysten/sui/transactions';
import { isValidSuiAddress } from '@mysten/sui/utils';
import { useNavigate } from '@tanstack/react-router';

import AddressBottomSheet from '@/components/AddressBottomSheet';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import ChainSelectBox from '@/components/ChainSelectBox';
import IconButton from '@/components/common/IconButton';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import SuiFee from '@/components/Fee/SuiFee';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { DEFAULT_GAS_BUDGET, DEFAULT_GAS_BUDGET_MULTIPLY } from '@/constants/sui/gas';
import { useCurrentAddedSuiNFTsWithMetaData } from '@/hooks/sui/useCurrentAddedSuiNFTsWithMetaData';
import { useDryRunTransaction } from '@/hooks/sui/useDryRunTransaction';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import TxProcessingOverlay from '@/pages/wallet/send/$coinId/-Entry/components/TxProcessingOverlay';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { gt, minus, plus, times, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, getUniqueChainId, isSameChain } from '@/utils/queryParamGenerator.ts';
import { isEqualsIgnoringCase, shorterAddress } from '@/utils/string.ts';
import { signAndExecuteTxSequentially } from '@/utils/sui/sign';

import { Divider, InputWrapper, NFTContainer, NFTImage, NFTName, NFTSubname } from './styled';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type SuiProps = { id: string };

export default function Sui({ id }: SuiProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);
  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { chainList } = useChainList();
  const { addedSuiNFTsWithMeta, isLoading: isLoadingSuiNFTs } = useCurrentAddedSuiNFTsWithMetaData();

  const selectedNFT = useMemo(() => addedSuiNFTsWithMeta.find((nft) => nft.id === id), [addedSuiNFTsWithMeta, id]);

  const chain = useMemo(
    () => chainList.suiChains?.find((chain) => chain.id === selectedNFT?.chainId && chain.chainType === selectedNFT.chainType),
    [chainList.suiChains, selectedNFT?.chainId, selectedNFT?.chainType],
  );

  const nftImage = selectedNFT?.image;
  const nftName = selectedNFT?.name || '-';
  const nftObjectId = selectedNFT?.objectId ? shorterAddress(selectedNFT.objectId, 12) : '-';

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const accountAsset = useMemo(
    () => chain && accountAllAssets?.suiAccountAssets.find((item) => isSameChain(item.chain, chain) && item.asset.id === chain.mainAssetDenom),
    [accountAllAssets?.suiAccountAssets, chain],
  );

  const feeCoinDecimals = accountAsset?.asset.decimals || 0;
  const availableFeeCoinBalance = accountAsset?.balance || '0';

  const accountAssetCoinId = useMemo(() => (accountAsset ? getCoinId(accountAsset.asset) : ''), [accountAsset]);

  const sendTx = useMemo<TransactionType | undefined>(() => {
    if (
      !selectedNFT?.objectId ||
      !recipientAddress ||
      !accountAsset?.address.address ||
      !(selectedNFT.originObject?.data?.content?.dataType === 'moveObject' && selectedNFT.originObject?.data.content.hasPublicTransfer)
    ) {
      return undefined;
    }

    const tx = new Transaction();
    tx.setSenderIfNotSet(accountAsset?.address.address);
    tx.transferObjects([tx.object(selectedNFT.objectId)], recipientAddress);
    return tx;
  }, [selectedNFT, recipientAddress, accountAsset]);

  const [debouncedTx] = useDebounce(sendTx, 600);

  const {
    data: dryRunTransaction,
    error: dryRunTransactionError,
    isFetching: isDryRunTransactionFetching,
  } = useDryRunTransaction({
    coinId: accountAssetCoinId,
    transaction: debouncedTx,
  });

  const expectedBaseFeeAmount = (() => {
    if (dryRunTransaction?.result?.effects.status.status === 'success') {
      const storageCost = minus(dryRunTransaction.result.effects.gasUsed.storageCost, dryRunTransaction.result.effects.gasUsed.storageRebate);

      const cost = plus(dryRunTransaction.result.effects.gasUsed.computationCost, gt(storageCost, 0) ? storageCost : 0);

      const baseBudget = Number(times(cost, DEFAULT_GAS_BUDGET_MULTIPLY));

      return baseBudget;
    }

    return DEFAULT_GAS_BUDGET;
  })();

  const displayExpectedBaseFeeAmount = toDisplayDenomAmount(expectedBaseFeeAmount, feeCoinDecimals);

  const addressInputErrorMessage = (() => {
    if (recipientAddress && (!isValidSuiAddress(recipientAddress) || isEqualsIgnoringCase(recipientAddress, accountAsset?.address.address))) {
      return t('pages.wallet.nft-send.$id.Entry.Sui.index.invalidAddress');
    }
    return '';
  })();

  const errorMessage = useMemo(() => {
    if (!recipientAddress) {
      return t('pages.wallet.send.$coinId.Entry.Sui.index.noRecipientAddress');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (gt(expectedBaseFeeAmount, availableFeeCoinBalance)) {
      return t('pages.wallet.nft-send.$id.Entry.Sui.index.insufficientAmount');
    }

    if (dryRunTransaction?.error?.message) {
      return dryRunTransaction?.error?.message;
    }

    if (dryRunTransactionError?.message) {
      const idx = dryRunTransactionError.message.lastIndexOf(':');

      return dryRunTransactionError.message.substring(idx === -1 ? 0 : idx + 1).trim();
    }

    if (dryRunTransaction?.result?.effects.status.error) {
      return dryRunTransaction?.result?.effects.status.error;
    }

    if (dryRunTransaction?.result?.effects.status.status !== 'success') {
      return 'Unknown error';
    }

    return '';
  }, [
    addressInputErrorMessage,
    availableFeeCoinBalance,
    dryRunTransaction?.error?.message,
    dryRunTransaction?.result?.effects.status.error,
    dryRunTransaction?.result?.effects.status.status,
    dryRunTransactionError?.message,
    expectedBaseFeeAmount,
    recipientAddress,
    t,
  ]);

  const handleOnClickConfirm = async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!chain) {
        throw new Error('Chain not found');
      }

      if (!debouncedTx) {
        throw new Error('Transaction not found');
      }

      const keyPair = getKeypair(chain, currentAccount, currentPassword);
      const privateKey = Buffer.from(keyPair.privateKey, 'hex');

      const signer = Ed25519Keypair.fromSecretKey(privateKey);
      const rpcURLs = chain.rpcUrls.map((item) => item.url) || [];

      if (!rpcURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signAndExecuteTxSequentially(signer, debouncedTx, rpcURLs);
      if (!response) {
        throw new Error('Failed to send transaction');
      }

      navigate({
        to: TxResult.to,
        search: {
          address: recipientAddress,
          coinId: accountAssetCoinId,
          txHash: response.digest,
        },
      });
    } catch {
      navigate({
        to: TxResult.to,
        search: {
          coinId: accountAssetCoinId,
        },
      });
    } finally {
      setIsOpenTxProcessingOverlay(false);
    }
  };

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 800);
  }, 800);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, sendTx, isDryRunTransactionFetching, isLoadingSuiNFTs]);

  return (
    <>
      <BaseBody>
        <>
          <NFTContainer>
            <NFTImage src={nftImage} />
            <NFTName variant="h2_B">{nftName}</NFTName>
            <NFTSubname>
              <Typography variant="b3_M">
                {t('pages.wallet.nft-send.$id.Entry.Sui.index.objectId', {
                  objectId: nftObjectId,
                })}
              </Typography>
            </NFTSubname>
          </NFTContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={chainList.suiChains || []}
              currentChainId={chain && getUniqueChainId(chain)}
              disabled
              label={t('pages.wallet.nft-send.$id.Entry.Sui.index.recipientNetwork')}
            />
            <StandardInput
              label={t('pages.wallet.nft-send.$id.Entry.Sui.index.recipientAddress')}
              error={!!addressInputErrorMessage}
              helperText={addressInputErrorMessage}
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              inputVarient="address"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton disabled={!chain} onClick={() => setIsOpenAddressBottomSheet(true)}>
                        <AddressBookIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </InputWrapper>
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <SuiFee
            displayFeeAmount={displayExpectedBaseFeeAmount}
            disableConfirm={!!errorMessage || isDisabled}
            isLoading={isDisabled}
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
          />
        </>
      </BaseFooter>
      {chain && (
        <AddressBottomSheet
          open={isOpenAddressBottomSheet}
          onClose={() => setIsOpenAddressBottomSheet(false)}
          filterAddress={accountAsset?.address.address}
          chainId={getUniqueChainId(chain)}
          headerTitle={t('pages.wallet.nft-send.$id.Entry.Sui.index.chooseRecipientAddress')}
          onClickAddress={(address) => {
            setRecipientAddress(address);
          }}
        />
      )}
      <ReviewBottomSheet
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.nft-send.$id.Entry.Sui.index.sendNFTReview')}
        contentsSubTitle={t('pages.wallet.nft-send.$id.Entry.Sui.index.sendNFTReviewSub')}
        confirmButtonText={t('pages.wallet.nft-send.$id.Entry.Sui.index.sendNFT')}
        onClickConfirm={handleOnClickConfirm}
      />
      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.nft-send.$id.Entry.Sui.index.txProcessing')}
        message={t('pages.wallet.nft-send.$id.Entry.Sui.index.txProcessingSub')}
      />
    </>
  );
}
