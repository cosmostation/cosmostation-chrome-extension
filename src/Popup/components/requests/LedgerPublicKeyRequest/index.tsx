import { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import EthereumApp from '@ledgerhq/hw-app-eth';
import { Typography } from '@mui/material';

import { COSMOS_CHAINS } from '~/constants/chain';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { LEDGER_SUPPORT_COIN_TYPE } from '~/constants/ledger';
import { COSMOS_POPUP_METHOD_TYPE } from '~/constants/message/cosmos';
import { ETHEREUM_POPUP_METHOD_TYPE } from '~/constants/message/ethereum';
import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import Divider from '~/Popup/components/common/Divider';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import LedgerToTab from '~/Popup/components/Loading/LedgerToTab';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useLedgerTransport } from '~/Popup/hooks/useLedgerTransport';
import { useLoading } from '~/Popup/hooks/useLoading';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import CosmosApp from '~/Popup/utils/ledger/cosmos';
import { responseToWeb } from '~/Popup/utils/message';
import type { Queue } from '~/types/chromeStorage';
import type { RequestMessage } from '~/types/message';

import {
  AccentSpan,
  BottomArrowContainer,
  BottomContainer,
  Container,
  ContentsContainer,
  StepContainer,
  StepDescription,
  StepImage,
  StepsContainer,
  StepTitle,
  TitleContainer,
} from './styled';

import Step1Icon from './assets/Step1.svg';
import Step2CosmosIcon from './assets/Step2Cosmos.svg';
import Step2CryptoOrg from './assets/Step2CryptoOrg.svg';
import Step2EthereumIcon from './assets/Step2Ethereum.svg';
import Step2Medibloc from './assets/Step2Medibloc.svg';
import BottomArrow28Icon from '~/images/icons/BottomArrow28.svg';

type AccessRequestProps = {
  children: JSX.Element;
};

export default function LedgerPublicKeyRequest({ children }: AccessRequestProps) {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { currentQueue, deQueue } = useCurrentQueue();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();
  const { currentAccount } = useCurrentAccount();
  const { enqueueSnackbar } = useSnackbar();

  const { setLoadingOverlay } = useLoading();

  const { closeTransport, createTransport } = useLedgerTransport();

  const { t } = useTranslation();

  const { accounts } = chromeStorage;

  const ethereumPopupMethods = Object.values(ETHEREUM_POPUP_METHOD_TYPE) as string[];

  const chain = useMemo(() => {
    if (isCosmos(currentQueue) && !!currentQueue?.message?.params?.chainName) {
      return [...COSMOS_CHAINS, ...currentCosmosAdditionalChains].find((item) => item.chainName === currentQueue.message.params.chainName);
    }

    if (ethereumPopupMethods.includes(currentQueue?.message?.method || '')) {
      return ETHEREUM;
    }

    return undefined;
  }, [currentCosmosAdditionalChains, currentQueue, ethereumPopupMethods]);

  if (currentAccount.type === 'LEDGER' && chain && currentQueue) {
    if (
      ![LEDGER_SUPPORT_COIN_TYPE.COSMOS, LEDGER_SUPPORT_COIN_TYPE.MEDIBLOC, LEDGER_SUPPORT_COIN_TYPE.CRYPTO_ORG].includes(chain.bip44.coinType) &&
      chain.line === 'COSMOS'
    ) {
      return null;
    }

    if (
      (!currentAccount.cosmosPublicKey && chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.COSMOS && chain.line === 'COSMOS') ||
      (!currentAccount.mediblocPublicKey && chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.MEDIBLOC && chain.line === 'COSMOS') ||
      (!currentAccount.cryptoOrgPublicKey && chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.CRYPTO_ORG && chain.line === 'COSMOS') ||
      (!currentAccount.ethereumPublicKey && chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.ETHEREUM && chain.line === 'ETHEREUM')
    ) {
      const Step2 = (() => {
        if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.COSMOS) return Step2CosmosIcon;
        if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.ETHEREUM) return Step2EthereumIcon;
        if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.MEDIBLOC) return Step2Medibloc;
        if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.CRYPTO_ORG) return Step2CryptoOrg;
        return null;
      })();

      const appName = (() => {
        if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.COSMOS) return 'Cosmos';
        if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.ETHEREUM) return 'Ethereum';
        if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.MEDIBLOC) return 'Medibloc';
        if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.CRYPTO_ORG) return 'Crypto.org Chain';
        return null;
      })();

      return (
        <BaseLayout>
          <Container>
            <PopupHeader account={currentAccount} />
            <Divider />
            <ContentsContainer>
              <TitleContainer>
                <Typography variant="h2">{t('components.requests.LedgerPublicKeyRequest.index.title')}</Typography>
              </TitleContainer>
              <StepsContainer>
                <StepContainer>
                  <StepImage>
                    <Step1Icon />
                  </StepImage>
                  <StepTitle>
                    <Typography variant="h3">Step 1</Typography>
                  </StepTitle>
                  <StepDescription>
                    <Typography variant="h5">{t('components.requests.LedgerPublicKeyRequest.index.step1Description')}</Typography>
                  </StepDescription>
                </StepContainer>
                <BottomArrowContainer>
                  <BottomArrow28Icon />
                </BottomArrowContainer>
                <StepContainer>
                  <StepImage>{Step2 && <Step2 />}</StepImage>
                  <StepTitle>
                    <Typography variant="h3">Step 2</Typography>
                  </StepTitle>
                  <StepDescription>
                    <Typography variant="h5">
                      {t('components.requests.LedgerPublicKeyRequest.index.step2Description1')}
                      <AccentSpan>{appName}</AccentSpan>
                      {t('components.requests.LedgerPublicKeyRequest.index.step2Description2')}
                    </Typography>
                  </StepDescription>
                </StepContainer>
              </StepsContainer>
            </ContentsContainer>

            <BottomContainer>
              <OutlineButton
                onClick={async () => {
                  responseToWeb({
                    response: {
                      error: {
                        code: RPC_ERROR.USER_REJECTED_REQUEST,
                        message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                      },
                    },
                    message: currentQueue.message,
                    messageId: currentQueue.messageId,
                    origin: currentQueue.origin,
                  });

                  await deQueue();
                }}
              >
                {t('components.requests.LedgerPublicKeyRequest.index.cancelButton')}
              </OutlineButton>
              <Button
                onClick={async () => {
                  try {
                    setLoadingOverlay(true);
                    const transport = await createTransport();

                    const accountIndex = accounts.findIndex((account) => account.id === currentAccount.id);

                    const newAccounts = [...accounts];

                    if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.COSMOS) {
                      const cosmosApp = new CosmosApp(transport);

                      const result = await cosmosApp.getPublicKey([44, 118, 0, 0, Number(currentAccount.bip44.addressIndex)]);

                      const publicKey = Buffer.from(result.compressed_pk).toString('hex');

                      if (accountIndex > -1) {
                        newAccounts.splice(accountIndex, 1, { ...currentAccount, cosmosPublicKey: publicKey });

                        await setChromeStorage('accounts', newAccounts);
                      }
                    }

                    if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.MEDIBLOC) {
                      const cosmosApp = new CosmosApp(transport);

                      const result = await cosmosApp.getPublicKey([44, 371, 0, 0, Number(currentAccount.bip44.addressIndex)]);

                      const publicKey = Buffer.from(result.compressed_pk).toString('hex');

                      if (accountIndex > -1) {
                        newAccounts.splice(accountIndex, 1, { ...currentAccount, mediblocPublicKey: publicKey });

                        await setChromeStorage('accounts', newAccounts);
                      }
                    }

                    if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.CRYPTO_ORG) {
                      const cosmosApp = new CosmosApp(transport);

                      const result = await cosmosApp.getPublicKey([44, 394, 0, 0, Number(currentAccount.bip44.addressIndex)]);

                      const publicKey = Buffer.from(result.compressed_pk).toString('hex');

                      if (accountIndex > -1) {
                        newAccounts.splice(accountIndex, 1, { ...currentAccount, cryptoOrgPublicKey: publicKey });

                        await setChromeStorage('accounts', newAccounts);
                      }
                    }

                    if (chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.ETHEREUM) {
                      const ethereumApp = new EthereumApp(transport);

                      const path = `${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${currentAccount.bip44.addressIndex}`;
                      const result = await ethereumApp.getAddress(path);

                      const { publicKey } = result;

                      if (accountIndex > -1) {
                        newAccounts.splice(accountIndex, 1, { ...currentAccount, ethereumPublicKey: publicKey });

                        await setChromeStorage('accounts', newAccounts);
                      }
                    }
                  } catch (e) {
                    enqueueSnackbar((e as { message: string }).message, { variant: 'error' });
                  } finally {
                    await closeTransport();
                    setLoadingOverlay(false);
                  }
                }}
              >
                {t('components.requests.LedgerPublicKeyRequest.index.completeButton')}
              </Button>
            </BottomContainer>
            <LedgerToTab />
          </Container>
        </BaseLayout>
      );
    }
  }
  return children;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Message = { method: any; params: { chainName?: string }; id?: number | string };

function isCosmos(queue: Queue<RequestMessage> | null): queue is Queue<Message> {
  const cosmosPopupMethods = Object.values(COSMOS_POPUP_METHOD_TYPE) as string[];

  return cosmosPopupMethods.includes(queue?.message?.method || '');
}
