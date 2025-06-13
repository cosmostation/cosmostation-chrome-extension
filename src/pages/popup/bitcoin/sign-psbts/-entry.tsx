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
import type { BitSignPsbts, BitSignPsbtsResposne } from '@/types/message/inject/bitcoin';
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
  request: BitSignPsbts;
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

  const [txMessagePage, setTxMessagePage] = useState(0);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Summary', 'View Details'];

  const keyPair = useMemo(
    () => currentBitcoinNetwork && getKeypair(currentBitcoinNetwork, currentAccount, currentPassword),
    [currentAccount, currentBitcoinNetwork, currentPassword],
  );

  const bitcoinNetwork = useMemo(() => (nativeAccountAsset?.chain.isTestnet ? networks.testnet : networks.bitcoin), [nativeAccountAsset?.chain.isTestnet]);

  const psbtHexes = request.params;

  const parsedPsbts = useMemo(
    () =>
      psbtHexes.map((psbtHex) => {
        const formattedPsbtHex = formatPsbtHex(psbtHex);
        const psbt = Psbt.fromHex(formattedPsbtHex, {
          network: bitcoinNetwork,
        });

        return psbt;
      }),
    [bitcoinNetwork, psbtHexes],
  );

  const decodedPsbtDatas = useMemo(
    () =>
      parsedPsbts.map((parsedPsbt) =>
        decodedPsbt({
          psbt: parsedPsbt,
          psbtNetwork: bitcoinNetwork,
        }),
      ),
    [bitcoinNetwork, parsedPsbts],
  );

  const canSend = useMemo(() => {
    const totalOutputAmount = decodedPsbtDatas.reduce(
      (acc, item) =>
        plus(
          acc,
          item.outputInfos.reduce((acc2, item2) => plus(acc2, item2?.value || '0'), '0'),
        ),
      '0',
    );
    const totalEstimatedFee = decodedPsbtDatas.reduce((acc, item) => plus(acc, item.fee), '0');

    return gte(nativeCoinAvailableAmount, plus(totalOutputAmount, totalEstimatedFee));
  }, [decodedPsbtDatas, nativeCoinAvailableAmount]);

  const currentPsbtHex = psbtHexes[txMessagePage];

  const errorMessage = useMemo(() => {
    if (gte('0', nativeCoinAvailableAmount) || !canSend) {
      return t('pages.popup.bitcoin.sign-psbts.entry.noAvailableAmount');
    }

    if (decodedPsbtDatas.length === 0) {
      return t('pages.popup.bitcoin.sign-psbts.entry.failedCreateTxHex');
    }

    return '';
  }, [canSend, decodedPsbtDatas, nativeCoinAvailableAmount, t]);

  const fee = useMemo(
    () =>
      decodedPsbtDatas.reduce((acc, item) => {
        return plus(acc, item.fee);
      }, '0'),
    [decodedPsbtDatas],
  );

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

      const result: BitSignPsbtsResposne = parsedPsbts.map((parsedPsbt) => {
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

        const txHex = parsedPsbt.finalizeAllInputs().toHex();

        if (!txHex) {
          throw new Error('Failed to sign transaction');
        }

        return txHex;
      });

      if (!result) {
        throw new Error('Failed to sign transaction');
      }

      await incrementTxCountForOrigin(request.origin);

      sendMessage<ResponseAppMessage<BitSignPsbts>>({
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
            <TxMessage
              psbtHex={currentPsbtHex}
              title="Sign"
              currentStep={txMessagePage}
              totalSteps={psbtHexes.length}
              onPageChange={(page) => {
                setTxMessagePage(page);
              }}
            />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <RawTxContainer>
              <RawTxMessage>
                <Typography variant="b3_M">{currentPsbtHex}</Typography>
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
              {t('pages.popup.bitcoin.sign-psbts.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button isProgress={isProcessing} disabled={!!errorMessage} onClick={handleOnClickSign}>
                  {t('pages.popup.bitcoin.sign-psbts.entry.sign')}
                </Button>
              </div>
            </Tooltip>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
