export type ResponseRPC<T> = {
  jsonrpc: string;
  result: T;
  id?: string | number;
};
