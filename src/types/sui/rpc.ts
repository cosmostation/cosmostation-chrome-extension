export type Owner = {
  AddressOwner: string;
};

export type Data = {
  dataType: string;
  type: string;
  has_public_transfer: boolean;
  fields: {
    balance: number;
    id: { id: string };
  };
  owner: Owner;
};

export type ErrorResponse = {
  code: number;
  message: string;
};

export type Result<T> = {
  jsonrpc: string;
  id: string | number;
  result?: T;
  error?: ErrorResponse;
};

export type Reference = {
  objectId: string;
  version: number;
  digest: string;
};

export type ExistsDetails = {
  data: Data;
  owner: Owner;
  previousTransaction: string;
  storageRebase: number;
  reference: Reference;
};

export type GetObjectsOwnedByAddress = {
  objectId: string;
  version: number;
  digest: string;
  type: string;
  owner: Owner;
  previousTransaction: string;
};

export type GetObjectsOwnedByAddressResponse = Result<GetObjectsOwnedByAddress[]>;

export type GetObjectExists = {
  status: 'Exists';
  details: ExistsDetails;
};
