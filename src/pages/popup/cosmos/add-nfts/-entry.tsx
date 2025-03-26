import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import Tooltip from '@/components/common/Tooltip';
import PaginationControls from '@/components/PaginationControls';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useOwnedNFTsTokenId } from '@/hooks/cosmos/nft/useOwnedNFTsTokenId';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentAccountNFT } from '@/hooks/useCurrentAccountNFT';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import DappInfo from '@/pages/popup/-components/DappInfo';
import NetworkInfo from '@/pages/popup/-components/NetworkInfo';
import type { CosmosChain } from '@/types/chain';
import type { ResponseAppMessage } from '@/types/message/content';
import type { CosAddNFTsCW721 } from '@/types/message/inject/cosmos';
import type { CosmosNFT } from '@/types/nft';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { getSiteTitle } from '@/utils/website';

import NFTItem from './-components/NFTItem';
import { ContentsContainer, Divider, LineDivider, MsgTitle, MsgTitleContainer, SticktFooterInnerBody } from './-styled';

type EntryProps = {
  request: CosAddNFTsCW721;
  chain: CosmosChain;
};

export default function Entry({ request, chain }: EntryProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();
  const { addNFT } = useCurrentAccountNFT();

  const [isProcessing, setIsProcessing] = useState(false);

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const keyPair = useMemo(() => getKeypair(chain, currentAccount, currentPassword), [currentAccount, chain, currentPassword]);

  const address = useMemo(() => getAddress(chain, keyPair?.publicKey), [chain, keyPair?.publicKey]);

  const { params } = request;
  const { nfts } = params;

  const qparams = useMemo(() => {
    if (!chain || !address) return undefined;

    return nfts.map((nft) => ({
      chainId: getUniqueChainId(chain),
      ownerAddress: address,
      contractAddress: nft.contractAddress,
      tokenId: nft.tokenId,
    }));
  }, [address, chain, nfts]);

  const ownedNFTs = useOwnedNFTsTokenId({ params: qparams });

  const currentNFT = useMemo(() => nfts[currentStep], [currentStep, nfts]);

  const errorMessage = useMemo(() => {
    if (ownedNFTs.error) {
      return t('pages.popup.cosmos.add-nfts.entry.networkError');
    }
    if (!ownedNFTs.data?.find((item) => item.tokens.includes(nfts.find((nft) => nft.contractAddress === item.contractAddress)?.tokenId || ''))) {
      return t('pages.popup.cosmos.add-nfts.entry.notOwned');
    }
    return '';
  }, [nfts, ownedNFTs.data, ownedNFTs.error, t]);

  const handleOnClickAdd = async () => {
    try {
      setIsProcessing(true);

      if (!chain) {
        throw new Error('accountAsset does not exist');
      }

      const newNFT: Omit<CosmosNFT, 'id'> = {
        contractAddress: currentNFT.contractAddress,
        tokenId: currentNFT.tokenId,
        chainId: chain.id,
        chainType: chain.chainType,
        tokenType: 'CW721',
      };

      await addNFT(newNFT);

      const result = null;

      sendMessage<ResponseAppMessage<CosAddNFTsCW721>>({
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
          <Divider />
          <NetworkInfo chainId={getUniqueChainId(chain)} />
          <LineDivider />
          <MsgTitleContainer>
            <MsgTitle variant="h3_B">{t('pages.popup.cosmos.add-nfts.entry.addSuggestedNFTs')}</MsgTitle>
            {nfts.length > 1 && (
              <PaginationControls
                currentPage={currentStep}
                totalPages={nfts.length}
                onPageChange={(page) => {
                  setCurrentStep(page);
                }}
              />
            )}
          </MsgTitleContainer>
        </EdgeAligner>
        <Divider
          sx={{
            marginBottom: '1.62rem',
          }}
        />
        <ContentsContainer>
          <NFTItem chain={chain} contractAddress={currentNFT.contractAddress} tokenId={currentNFT.tokenId} />
        </ContentsContainer>
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
              {t('pages.popup.cosmos.add-nfts.entry.reject')}
            </Button>
          }
          confirmButton={
            <Tooltip title={errorMessage} varient="error" placement="top">
              <div>
                <Button disabled={!!errorMessage} isProgress={isProcessing} onClick={handleOnClickAdd}>
                  {t('pages.popup.cosmos.add-nfts.entry.addNFT')}
                </Button>
              </div>
            </Tooltip>
          }
        />
      </SticktFooterInnerBody>
    </>
  );
}
