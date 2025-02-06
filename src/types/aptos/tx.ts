import type { CommittedTransactionResponse, GenesisTransactionResponse } from '@aptos-labs/ts-sdk';

export type AccountTx = Exclude<CommittedTransactionResponse, GenesisTransactionResponse>;
