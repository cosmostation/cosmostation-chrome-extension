export type NodeInfo = {
  protocal_version: {
    p2p: string;
    block: string;
    app: string;
  };
  id: string;
  listen_addr: string;
  network: string;
  version: string;
  channels: string;
  moniker: string;
  other: {
    tx_index: string;
    rpc_address: string;
  };
};

type ApplicationVersion = {
  name: string;
  server_name: string;
  version: string;
  commit: string;
  build_tags: string;
  go: string;
  build_deps: string[];
  cosmos_sdk_version?: string;
};

export type NodeInfoPayload = {
  default_node_info: NodeInfo;
  application_version: ApplicationVersion;
};
