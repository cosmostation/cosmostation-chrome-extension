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

export type GetObjectsOwnedByAddress = {
  objectId: string;
  version: number;
  digest: string;
  type: string;
  owner: Owner;
  previousTransaction: string;
};

export type GetObjectsOwnedByAddressResponse = Result<GetObjectsOwnedByAddress[]>;

export type ExistsDetails = {
  data: Data;
  owner: Owner;
  previousTransaction: string;
  storageRebase: number;
  reference: Reference;
};

export type DeletedDetails = {
  objectId: string;
  version: number;
  digest: string;
};

export type NotExistsDetails = string;

export type GetObjectExists = {
  status: 'Exists';
  details: ExistsDetails;
};

export type GetObjectDeleted = {
  status: 'Deleted';
  details: DeletedDetails;
};

export type GetObjectNotExists = {
  status: 'NotExists';
  details: NotExistsDetails;
};

export type GetObjectResponse = Result<GetObjectNotExists | GetObjectDeleted | GetObjectExists>;

export type GetCoinMetadata = {
  decimals: number;
  description: string;
  iconUrl: string | null;
  id: string | null;
  name: string;
  symbol: string;
};

export type GetCoinMetadataResponse = Result<GetCoinMetadata>;
