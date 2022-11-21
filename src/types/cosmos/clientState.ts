export type ClientStatePayload = {
  identified_client_state?: IdentifiedClientState;
};

export type IdentifiedClientState = {
  client_id?: string;
  client_state?: ClientState;
};

export type ClientState = {
  latest_height?: Height;
};

export type Height = {
  revision_height: string;
  revision_number: string;
};
