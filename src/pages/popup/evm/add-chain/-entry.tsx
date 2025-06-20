import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import InformationPanel from '@/components/InformationPanel';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useChainList } from '@/hooks/useChainList';
import { useCustomAssets } from '@/hooks/useCustomAssets';
import { useCustomChain } from '@/hooks/useCustomChain';
import { sendMessage } from '@/libs/extension';
import type { CustomAsset } from '@/types/asset';
import type { CustomEvmChain } from '@/types/chain';
import type { EvmRpc } from '@/types/evm/api';
import type { ResponseAppMessage } from '@/types/message/content';
import type { EthcAddNetwork } from '@/types/message/inject/evm';
import { requestRPC } from '@/utils/ethereum';
import { removeTrailingSlash, toHex } from '@/utils/string';
import { getSiteTitle } from '@/utils/website';

import { DetailWrapper, Divider, InformationContainer, LabelContainer, LineDivider } from './-styled';
import AssetContainer from '../../-components/AssetContainer';
import DappInfo from '../../-components/DappInfo';
import RequestMethodTitle from '../../-components/RequestMethodTitle';

type EntryProps = {
  request: EthcAddNetwork;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();

  const [isProcessing, setIsProcessing] = useState(false);
  const { chainList } = useChainList();

  const { addCustomChain } = useCustomChain();
  const { addCustomAsset } = useCustomAssets();

  const { imageURL, networkName, chainId, displayDenom, rpcURL } = request.params[0];

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const handleOnClickAdd = async () => {
    try {
      setIsProcessing(true);

      const paramData = request.params[0];

      const trimmedRpcUrl = removeTrailingSlash(paramData.rpcURL);

      const response = await requestRPC<EvmRpc<string>>('eth_chainId', [], '1', trimmedRpcUrl);

      const convertChainId = toHex(paramData.chainId, { addPrefix: true, isStringNumber: true });

      if (response.result !== convertChainId) {
        throw Error(
          `Chain ID returned by RPC URL ${paramData.rpcURL} does not match ${paramData.chainId} (${convertChainId}) (result: ${response.result || ''})`,
        );
      }

      const invalidChainIds = chainList?.allEVMChains.map((chain) => chain.chainId) || [];

      if (invalidChainIds.includes(convertChainId)) {
        throw Error(`Can't add ${paramData.chainId}`);
      }

      const trimmedExplorerUrl = paramData.explorerURL && removeTrailingSlash(paramData.explorerURL);

      const newChain: CustomEvmChain = {
        id: uuidv4(),
        chainId: convertChainId,
        chainType: 'evm',
        name: paramData.networkName,
        image: paramData.imageURL || '',
        mainAssetDenom: NATIVE_EVM_COIN_ADDRESS,
        chainDefaultCoinDenoms: [NATIVE_EVM_COIN_ADDRESS],
        isCosmos: false,
        rpcUrls: [
          {
            provider: 'Custom',
            url: trimmedRpcUrl,
          },
        ],
        explorer: {
          name: 'Custom',
          url: trimmedExplorerUrl || '',
          account: '',
          tx: '',
          proposal: '',
        },
        feeInfo: {
          isEip1559: false,
          gasCoefficient: 1.3,
        },
        accountTypes: [
          {
            hdPath: "m/44'/60'/0'/0/${index}",
            pubkeyStyle: 'keccak256',
            isDefault: null,
          },
        ],
      };

      const mainCoin: CustomAsset = {
        id: NATIVE_EVM_COIN_ADDRESS,
        chainId: newChain.id,
        chainType: 'evm',
        type: 'native',
        name: paramData.displayDenom,
        symbol: paramData.displayDenom,
        decimals: 18,
        image: paramData.tokenImageURL || '',
        coinGeckoId: paramData.coinGeckoId || '',
      };

      await addCustomChain(newChain);

      await addCustomAsset(mainCoin);

      const result = null;

      sendMessage<ResponseAppMessage<EthcAddNetwork>>({
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
          <DappInfo image={siteIconURL} name={siteTitle} url={currentRequestQueue?.origin} />
          <LineDivider />
          <RequestMethodTitle title={t('pages.popup.evm.add-chain.entry.addCustomChain')} />
        </EdgeAligner>
        <Divider />

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              margin: '1.2rem 0 1rem',
            }}
          >
            {t('pages.popup.evm.add-chain.entry.networkToAdd')}
          </Base1000Text>
          <AssetContainer
            chainImageURL={imageURL || 'unknown'}
            leftHeaderComponent={<Base1300Text variant="b2_M">{networkName}</Base1300Text>}
            leftSubHeaderComponent={<Base1000Text variant="b4_R">{`Chain ID : ${chainId}`}</Base1000Text>}
          />
        </LabelContainer>
        <Divider
          sx={{
            margin: '1.6rem 0 1.2rem',
          }}
        />
        <DetailWrapper>
          <LabelContainer>
            <Base1000Text
              variant="b3_R"
              sx={{
                marginBottom: '0.4rem',
              }}
            >
              {t('pages.popup.evm.add-chain.entry.currencySymbol')}
            </Base1000Text>
            <Base1300Text variant="b3_M">{displayDenom}</Base1300Text>
          </LabelContainer>
          <LabelContainer>
            <Base1000Text
              variant="b3_R"
              sx={{
                marginBottom: '0.4rem',
              }}
            >
              {t('pages.popup.evm.add-chain.entry.networkURL')}
            </Base1000Text>
            <Base1300Text variant="b3_M">{rpcURL}</Base1300Text>
          </LabelContainer>
        </DetailWrapper>
      </BaseBody>
      <BaseFooter>
        <InformationContainer>
          <InformationPanel
            varitant="caution"
            title={<Typography variant="b3_M">{t('pages.popup.evm.add-chain.entry.cautionTitle')}</Typography>}
            body={<Typography variant="b4_R_Multiline">{t('pages.popup.evm.add-chain.entry.cautionDescription')}</Typography>}
          />
        </InformationContainer>
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
              {t('pages.popup.evm.add-chain.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickAdd}>
              {t('pages.popup.evm.add-chain.entry.addChain')}
            </Button>
          }
        />
      </BaseFooter>
    </>
  );
}
