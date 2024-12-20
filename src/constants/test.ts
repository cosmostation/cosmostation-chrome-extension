import type { Chain } from '@/types/chain';

// TODO - Need to erase
export const TEST_CHAIN_LIST: Chain[] = [
  {
    id: 'cosmos-unique-id',
    chainType: 'cosmos',
    chainId: 'cosmos',
    name: 'Cosmos',
    image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    mainAssetDenom: 'ATOM',
    accountPrefix: 'cosmos',
    isCosmwasm: false,
    isEvm: false,
    lcdUrls: [
      {
        url: 'https://lcd.terra.dev',
        provider: 'Terra',
      },
    ],
    explorer: null,
    feeInfo: {
      isSimulable: true,
      gasRate: ['0.15uusd'],
      defaultGasLimit: '200000',
      gasCoefficient: 1.25,
    },
    accountTypes: [],
  },
  {
    id: 'ethereum-unique-id',
    chainType: 'evm',
    chainId: 'ethereum',
    name: 'Ethereum',
    image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    mainAssetDenom: '0xEE',
    isCosmos: false,
    feeInfo: {
      isEip1559: true,
      gasCoefficient: 1.25,
    },
    rpcUrls: [
      {
        url: 'https://mainnet.infura.io/v3/your-infura-id',
        provider: 'Infura',
      },
    ],
    accountTypes: [],
    explorer: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
      account: '/address',
      tx: '/tx',
      proposal: '',
    },
  },
];

export const DUMMY_REWARDS = [
  {
    validator_address: 'cosmosvaloper1g48268mu5vfp4wk7dk89r0wdrakm9p5xk0q50k',
    reward: [
      {
        denom: 'ibc/0025F8A87464A471E66B234C4F93AEC5B4DA3D42D7986451A059273426290DD5',
        amount: '0.003216381433783000',
      },
      {
        denom: 'ibc/054892D6BB43AF8B93AAC28AA5FD7019D2C59A15DAFD6F45C1FA2BF9BDA22454',
        amount: '0.014556803297784000',
      },
      {
        denom: 'ibc/5CAE744C89BC70AE7B38019A1EDF83199B7E10F00F160E7F4F12BCA7A32A7EE5',
        amount: '0.000142359298774000',
      },
      {
        denom: 'ibc/6B8A3F5C2AD51CD6171FA41A7E8C35AD594AB69226438DB94450436EA57B3A89',
        amount: '0.026595157274571000',
      },
      {
        denom: 'ibc/715BD634CF4D914C3EE93B0F8A9D2514B743F6FE36BC80263D1BC5EE4B3C5D40',
        amount: '0.022818319994579000',
      },
      {
        denom: 'ibc/88DCAA43A9CD099E1F9BBB80B9A90F64782EBA115A84B2CD8398757ADA4F4B40',
        amount: '0.002267308021692000',
      },
      {
        denom: 'ibc/A4D99E716D91A579AC3A9684AAB7B5CB0A0861DD3DD942901D970EDB6787860E',
        amount: '0.000104199655091000',
      },
      {
        denom: 'ibc/B011C1A0AD5E717F674BA59FD8E05B2F946E4FD41C9CB3311C95F7ED4B815620',
        amount: '13509241.318098852878220000',
      },
      {
        denom: 'ibc/B05539B66B72E2739B986B86391E5D08F12B8D5D2C2A7F8F8CF9ADF674DFA231',
        amount: '0.003726641123838000',
      },
      {
        denom: 'ibc/B38AAA0F7A3EC4D7C8E12DFA33FF93205FE7A42738A4B0590E2FF15BC60A612B',
        amount: '3035592242.209706620116181000',
      },
      {
        denom: 'ibc/D41ECC8FEF1B7E9C4BCC58B1362588420853A9D0B898EDD513D9B79AFFA195C8',
        amount: '0.027006147138019000',
      },
      {
        denom: 'ibc/E92E07E68705FAD13305EE9C73684B30A7B66A52F54C9890327E0A4C0F1D22E3',
        amount: '0.001395266496037000',
      },
      {
        denom: 'ibc/FA33D22EED651DC2D251315AAE2E7C5BA924D308081EE9760AE653AA2F6661CB',
        amount: '0.000002997796330000',
      },
      {
        denom: 'uatom',
        amount: '26.502817990699137000',
      },
    ],
  },
  {
    validator_address: 'cosmosvaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0',
    reward: [
      {
        denom: 'ibc/0025F8A87464A471E66B234C4F93AEC5B4DA3D42D7986451A059273426290DD5',
        amount: '0.002923872362518464',
      },
      {
        denom: 'ibc/054892D6BB43AF8B93AAC28AA5FD7019D2C59A15DAFD6F45C1FA2BF9BDA22454',
        amount: '0.013232349373917699',
      },
      {
        denom: 'ibc/5CAE744C89BC70AE7B38019A1EDF83199B7E10F00F160E7F4F12BCA7A32A7EE5',
        amount: '0.000129406452514191',
      },
      {
        denom: 'ibc/6B8A3F5C2AD51CD6171FA41A7E8C35AD594AB69226438DB94450436EA57B3A89',
        amount: '0.024174206294782464',
      },
      {
        denom: 'ibc/715BD634CF4D914C3EE93B0F8A9D2514B743F6FE36BC80263D1BC5EE4B3C5D40',
        amount: '0.020742166825967718',
      },
      {
        denom: 'ibc/88DCAA43A9CD099E1F9BBB80B9A90F64782EBA115A84B2CD8398757ADA4F4B40',
        amount: '0.002061009929803950',
      },
      {
        denom: 'ibc/A4D99E716D91A579AC3A9684AAB7B5CB0A0861DD3DD942901D970EDB6787860E',
        amount: '0.000094721196243069',
      },
      {
        denom: 'ibc/B011C1A0AD5E717F674BA59FD8E05B2F946E4FD41C9CB3311C95F7ED4B815620',
        amount: '12280084.986053525630425245',
      },
      {
        denom: 'ibc/B05539B66B72E2739B986B86391E5D08F12B8D5D2C2A7F8F8CF9ADF674DFA231',
        amount: '0.003387556794813381',
      },
      {
        denom: 'ibc/B38AAA0F7A3EC4D7C8E12DFA33FF93205FE7A42738A4B0590E2FF15BC60A612B',
        amount: '2759400947.735123247686750364',
      },
      {
        denom: 'ibc/D41ECC8FEF1B7E9C4BCC58B1362588420853A9D0B898EDD513D9B79AFFA195C8',
        amount: '0.024548921720992314',
      },
      {
        denom: 'ibc/E92E07E68705FAD13305EE9C73684B30A7B66A52F54C9890327E0A4C0F1D22E3',
        amount: '0.001268310241312407',
      },
      {
        denom: 'ibc/FA33D22EED651DC2D251315AAE2E7C5BA924D308081EE9760AE653AA2F6661CB',
        amount: '0.000002725218155475',
      },
      {
        denom: 'uatom',
        amount: '24.091065340842087999',
      },
    ],
  },
];
