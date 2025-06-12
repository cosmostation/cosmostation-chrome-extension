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
import { PUBKEY_STYLE, PUBKEY_TYPE_MAP } from '@/constants/cosmos';
import { COSMOS_DEFAULT_GAS } from '@/constants/cosmos/gas';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCustomAssets } from '@/hooks/useCustomAssets';
import { useCustomChain } from '@/hooks/useCustomChain';
import { sendMessage } from '@/libs/extension';
import type { CustomAsset } from '@/types/asset';
import type { CustomCosmosChain } from '@/types/chain';
import type { CosRequestAddChain, CosRequestAddChainResponse } from '@/types/message/inject/cosmos';
import { removeTrailingSlash } from '@/utils/string';
import { getSiteTitle } from '@/utils/website';

import { DetailWrapper, Divider, InformationContainer, LabelContainer, LineDivider } from './-styled';
import AssetContainer from '../../-components/AssetContainer';
import DappInfo from '../../-components/DappInfo';
import RequestMethodTitle from '../../-components/RequestMethodTitle';

type EntryProps = {
  request: CosRequestAddChain;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();

  const [isProcessing, setIsProcessing] = useState(false);

  const { addCustomChain } = useCustomChain();
  const { addCustomAsset } = useCustomAssets();

  const { imageURL, chainName, chainId, displayDenom, restURL } = request.params;

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const handleOnClickAdd = async () => {
    try {
      setIsProcessing(true);

      const trimmedRestUrl = removeTrailingSlash(request.params.restURL);

      const chainId = request.params.chainId;

      const formattedCoinType = request.params.coinType
        ? request.params.coinType.endsWith("'")
          ? request.params.coinType
          : `${request.params.coinType}'`
        : "118'";
      const selectedPubkeyStyle = request.params.type === 'ETHERMINT' ? PUBKEY_STYLE.ethsecp256k1 : PUBKEY_STYLE.secp256k1;
      const newChain: CustomCosmosChain = {
        id: uuidv4(),
        chainId,
        chainType: 'cosmos',
        name: request.params.chainName,
        image: request.params.imageURL || '',
        mainAssetDenom: request.params.baseDenom,
        chainDefaultCoinDenoms: request.params.baseDenom ? [request.params.baseDenom] : undefined,
        accountPrefix: request.params.addressPrefix,
        isCosmwasm: false,
        isEvm: false,
        lcdUrls: [
          {
            provider: 'Custom',
            url: trimmedRestUrl,
          },
        ],
        explorer: null,
        feeInfo: {
          isSimulable: false,
          isFeemarketEnabled: false,
          defaultFeeRateKey: '0',
          gasRate: [
            `${request.params.gasRate?.tiny || 0.00025}${request.params.baseDenom}`,
            `${request.params.gasRate?.low || 0.0025}${request.params.baseDenom}`,
            `${request.params.gasRate?.average || 0.025}${request.params.baseDenom}`,
          ],
          defaultGasLimit: request.params.sendGas || COSMOS_DEFAULT_GAS,
          gasCoefficient: 1.3,
        },
        accountTypes: [
          {
            hdPath: `m/44'/${formattedCoinType}/0'/0/\${index}`,
            pubkeyStyle: selectedPubkeyStyle,
            pubkeyType: PUBKEY_TYPE_MAP[selectedPubkeyStyle],
          },
        ],
      };

      const mainCoin: CustomAsset = {
        id: request.params.baseDenom,
        chainId: newChain.id,
        chainType: 'cosmos',
        type: 'native',
        name: request.params.displayDenom,
        symbol: request.params.displayDenom,
        decimals: request.params.decimals || 6,
        image: request.params.tokenImageURL || request.params.imageURL || '',
        coinGeckoId: request.params.coinGeckoId || '',
      };

      await addCustomChain(newChain);
      await addCustomAsset(mainCoin);

      const result: CosRequestAddChainResponse = true;
      sendMessage({
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
          <RequestMethodTitle title={t('pages.popup.cosmos.addChain.entry.addCustomChain')} />
        </EdgeAligner>
        <Divider />

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              margin: '1.2rem 0 1rem',
            }}
          >
            {t('pages.popup.cosmos.addChain.entry.networkToAdd')}
          </Base1000Text>
          <AssetContainer
            chainImageURL={imageURL || 'unknown'}
            leftHeaderComponent={<Base1300Text variant="b2_M">{chainName}</Base1300Text>}
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
              {t('pages.popup.cosmos.addChain.entry.currencySymbol')}
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
              {t('pages.popup.cosmos.addChain.entry.networkURL')}
            </Base1000Text>
            <Base1300Text variant="b3_M">{restURL}</Base1300Text>
          </LabelContainer>
        </DetailWrapper>
      </BaseBody>
      <BaseFooter>
        <InformationContainer>
          <InformationPanel
            varitant="caution"
            title={<Typography variant="b3_M">{t('pages.popup.cosmos.addChain.entry.cautionTitle')}</Typography>}
            body={<Typography variant="b4_R_Multiline">{t('pages.popup.cosmos.addChain.entry.cautionDescription')}</Typography>}
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
              {t('pages.popup.cosmos.addChain.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickAdd}>
              {t('pages.popup.cosmos.addChain.entry.addChain')}
            </Button>
          }
        />
      </BaseFooter>
    </>
  );
}
