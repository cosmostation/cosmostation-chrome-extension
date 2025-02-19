import type {
  AccountAddressInput,
  AnyRawTransaction,
  CommittedTransactionResponse,
  GenesisTransactionResponse,
  InputGenerateTransactionOptions,
  InputGenerateTransactionPayloadData,
  InputSimulateTransactionOptions,
  PublicKey,
} from '@aptos-labs/ts-sdk';

export type AccountTx = Exclude<CommittedTransactionResponse, GenesisTransactionResponse>;

export interface AptosSignPayload {
  sender: AccountAddressInput;
  data: InputGenerateTransactionPayloadData;
  options?: InputGenerateTransactionOptions;
  withFeePayer?: boolean;
}

export interface AptosSimulationPayload {
  signerPublicKey?: PublicKey;
  transaction: AnyRawTransaction;
  feePayerPublicKey?: PublicKey;
  options?: InputSimulateTransactionOptions;
}
