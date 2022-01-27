export class EthereumRPCError extends Error {
  public code: number;

  public id?: string | number;

  public rpcMessage: unknown;

  constructor(code: number, message: string, id?: string | number) {
    super(message);
    this.name = 'EthereumRPCError';
    this.code = code;
    this.id = id;

    const errorMessage = {
      error: {
        code,
        message,
      },
      jsonrpc: '2.0',
    };

    this.rpcMessage = id
      ? {
          ...errorMessage,
          id,
        }
      : errorMessage;

    Object.setPrototypeOf(this, EthereumRPCError.prototype);
  }
}
