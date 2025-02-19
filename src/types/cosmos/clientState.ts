export interface ClientStateResonse {
  identified_client_state?: IdentifiedClientState;
}

export interface IdentifiedClientState {
  client_id?: string;
  client_state?: ClientState;
}

export interface ClientState {
  latest_height?: Height;
}

export interface Height {
  revision_height: string;
  revision_number: string;
}
