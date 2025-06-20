import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { networks, Psbt } from 'bitcoinjs-lib';
import { isTaprootInput } from 'bitcoinjs-lib/src/psbt/bip371';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useCurrentBitcoinNetwork } from '@/hooks/bitcoin/useCurrentBitcoinNetwork';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import BaseTxInfo from '@/pages/popup/-components/BaseTxInfo';
import DappInfo from '@/pages/popup/-components/DappInfo';
import type { ResponseAppMessage } from '@/types/message/content';
import type { BitSignPsbt } from '@/types/message/inject/bitcoin';
import { decodedPsbt, ecpairFromPrivateKey, formatPsbtHex, getTweakSigner } from '@/utils/bitcoin/tx';
import { gte, plus } from '@/utils/numbers';
import { getCoinId, isSameChain } from '@/utils/queryParamGenerator';
import { getSiteTitle } from '@/utils/website';

import {
  Divider,
  DividerContainer,
  LineDivider,
  RawTxContainer,
  RawTxMessage,
  SticktFooterInnerBody,
  StickyTabContainer,
  StyledTabPanel,
  TxBaseInfoContainer,
} from './-styled';
import TxMessage from '../-components/TxMessage';

type EntryProps = {
  request: BitSignPsbt;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();
  const { deQueue } = useCurrentRequestQueue();

  const { currentBitcoinNetwork } = useCurrentBitcoinNetwork();

  const { currentAccount, incrementTxCountForOrigin } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const nativeAccountAsset = useMemo(
    () => currentBitcoinNetwork && accountAllAssets?.bitcoinAccountAssets.find((item) => isSameChain(item.chain, currentBitcoinNetwork)),
    [accountAllAssets?.bitcoinAccountAssets, currentBitcoinNetwork],
  );

  const nativeAccountAssetCoinId = useMemo(() => (nativeAccountAsset ? getCoinId(nativeAccountAsset.asset) : ''), [nativeAccountAsset]);
  const nativeCoinAvailableAmount = useMemo(() => nativeAccountAsset?.balance || '0', [nativeAccountAsset?.balance]);

  const { siteIconURL } = useSiteIconURL(origin);
  const siteTitle = getSiteTitle(origin);

  const [isProcessing, setIsProcessing] = useState(false);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Summary', 'View Details'];

  const keyPair = useMemo(
    () => currentBitcoinNetwork && getKeypair(currentBitcoinNetwork, currentAccount, currentPassword),
    [currentAccount, currentBitcoinNetwork, currentPassword],
  );

  const bitcoinNetwork = useMemo(() => (nativeAccountAsset?.chain.isTestnet ? networks.testnet : networks.bitcoin), [nativeAccountAsset?.chain.isTestnet]);

  const psbtHex = request.params;

  const parsedPsbt = useMemo(() => {
    const formattedPsbtHex = formatPsbtHex(psbtHex);

    const psbt = Psbt.fromHex(formattedPsbtHex, {
      network: bitcoinNetwork,
    });

    return psbt;
  }, [bitcoinNetwork, psbtHex]);

  const decodedPsbtData = useMemo(
    () =>
      decodedPsbt({
        psbt: parsedPsbt,
        psbtNetwork: bitcoinNetwork,
      }),
    [bitcoinNetwork, parsedPsbt],
  );

  const totalInputAmount = useMemo(
    () => decodedPsbtData.inputInfos.reduce((totalVal, cur) => plus(totalVal, cur?.value || '0'), '0'),
    [decodedPsbtData.inputInfos],
  );

  const totalOutputAmount = useMemo(
    () => decodedPsbtData.outputInfos.reduce((totalVal, cur) => plus(totalVal, cur?.value || '0'), '0'),
    [decodedPsbtData.outputInfos],
  );

  const fee = useMemo(() => decodedPsbtData.fee, [decodedPsbtData.fee]);

  const canSendTx = useMemo(
    () => gte(nativeCoinAvailableAmount, plus(totalOutputAmount, decodedPsbtData.fee)),
    [nativeCoinAvailableAmount, totalOutputAmount, decodedPsbtData.fee],
  );

  const errorMessage = useMemo(() => {
    if (gte('0', nativeCoinAvailableAmount) || !canSendTx) {
      return t('pages.popup.bitcoin.sign-psbt.entry.noAvailableAmount');
    }

    if (!totalInputAmount) {
      return t('pages.popup.bitcoin.sign-psbt.entry.noAmount');
    }

    if (!psbtHex) {
      return t('pages.popup.bitcoin.sign-psbt.entry.failedCreateTxHex');
    }

    return '';
  }, [canSendTx, nativeCoinAvailableAmount, psbtHex, t, totalInputAmount]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const handleOnClickSign = async () => {
    try {
      setIsProcessing(true);

      if (!keyPair?.privateKey) {
        throw new Error('key does not exist');
      }

      const signer = ecpairFromPrivateKey(keyPair.privateKey);

      const tweakSigner = getTweakSigner(currentAccount, currentBitcoinNetwork, currentPassword, {
        tweakHash: null,
        network: currentBitcoinNetwork.isTestnet ? 'testnet' : 'mainnet',
      });

      parsedPsbt.data.inputs.forEach((input, index) => {
        if (isTaprootInput(input)) {
          if (input.tapLeafScript && input.tapLeafScript?.length > 0 && !input.tapMerkleRoot) {
            parsedPsbt.signInput(index, signer);
          } else {
            parsedPsbt.signInput(index, tweakSigner!);
          }
        } else {
          parsedPsbt.signInput(index, signer);
        }
      });

      const result = parsedPsbt.finalizeAllInputs().toHex();

      if (!result) {
        throw new Error('Failed to sign transaction');
      }

      await incrementTxCountForOrigin(request.origin);

      sendMessage<ResponseAppMessage<BitSignPsbt>>({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          result,
        },
      });
    } catch {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          error: {
            code: RPC_ERROR.INVALID_INPUT,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_INPUT]}`,
          },
        },
      });
    } finally {
      setIsProcessing(false);

      await deQueue();
    }
  };

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image={siteIconURL} name={siteTitle} url={origin} />
          <Divider />
          <TxBaseInfoContainer>
            <BaseTxInfo feeCoinId={nativeAccountAssetCoinId} feeBaseAmount={String(fee)} disableFee />
          </TxBaseInfoContainer>
          <DividerContainer>
            <Divider />
          </DividerContainer>
          <LineDivider />
          <StickyTabContainer>
            <FilledTabs value={tabValue} onChange={handleChange} variant="fullWidth">
              {tabLabels.map((item) => (
                <FilledTab key={item} label={item} />
              ))}
            </FilledTabs>
          </StickyTabContainer>
          <StyledTabPanel value={tabValue} index={0}>
            <TxMessage psbtHex={psbtHex} title="Sign" />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <RawTxContainer>
              <RawTxMessage>
                <Typography variant="b3_M">{psbtHex}</Typography>
              </RawTxMessage>
            </RawTxContainer>
          </StyledTabPanel>
        </EdgeAligner>
      </BaseBody>

      <SticktFooterInnerBody>
        <SplitButtonsLayout
          cancelButton={
            <Button
              onClick={async () => {
                sendMessage({
                  target: 'CONTENT',
                  method: 'responseApp',
                  origin: request.origin,
                  requestId: request.requestId,
                  tabId: request.tabId,
                  params: {
                    id: request.requestId,
                    error: {
                      code: RPC_ERROR.USER_REJECTED_REQUEST,
                      message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                    },
                  },
                });

                await deQueue();
              }}
              variant="dark"
            >
              {t('pages.popup.bitcoin.sign-psbt.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button isProgress={isProcessing} disabled={!!errorMessage} onClick={handleOnClickSign}>
                  {t('pages.popup.bitcoin.sign-psbt.entry.sign')}
                </Button>
              </div>
            </Tooltip>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
