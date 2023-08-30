export type Transaction = PendingTransaction | UserTransaction | GenesisTransaction | BlockMetadataTransaction | StateCheckpointTransaction;

export type PendingTransaction = {
  type: 'pending_transaction';
  hash: string;
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  // payload: TransactionPayload$1;
  payload: null;
  // signature?: TransactionSignature;
  signature?: null;
};

export type UserTransaction = {
  type: 'user_transaction';
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash?: string;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  // changes: Array<WriteSetChange>;
  changes: null;
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  // payload: TransactionPayload$1;
  payload: null;
  // signature?: TransactionSignature;
  signature?: null;
  events: Array<Event>;
  timestamp: string;
};

export type GenesisTransaction = {
  type: 'genesis_transaction';
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash?: string;
  gas_used: string;

  success: boolean;

  vm_status: string;
  accumulator_root_hash: string;

  // changes: Array<WriteSetChange>;
  changes: null;
  //   payload: GenesisPayload;

  payload: null;
  events: Array<Event>;
};

export type BlockMetadataTransaction = {
  type: 'block_metadata_transaction';
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash?: string;
  gas_used: string;

  success: boolean;

  vm_status: string;
  accumulator_root_hash: string;
  // changes: Array<WriteSetChange>;
  changes: null;
  id: string;
  epoch: string;
  round: string;
  events: Array<Event>;
  previous_block_votes_bitvec: Array<number>;
  proposer: string;
  failed_proposer_indices: Array<number>;
  timestamp: string;
};

export type StateCheckpointTransaction = {
  type: 'state_checkpoint_transaction';
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash?: string;
  gas_used: string;

  success: boolean;

  vm_status: string;
  accumulator_root_hash: string;

  // changes: Array<WriteSetChange>;
  changes: null;
  timestamp: string;
};
