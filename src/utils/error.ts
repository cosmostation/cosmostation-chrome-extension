export class EthereumRPCError extends Error {
  public code: number;

  public id?: string | number;

  public rpcMessage: {
    error: {
      code: number;
      message: string;
      data?: unknown;
    };
    id?: string | number;
    jsonrpc: string;
  };

  constructor(code: number, message: string, id?: string | number, data?: unknown) {
    super(message);
    this.name = 'EthereumRPCError';
    this.code = code;
    this.id = id;

    const errorMessage = {
      error: {
        code,
        message,
        data,
      },
      id,
      jsonrpc: '2.0',
    };

    this.rpcMessage = errorMessage;

    Object.setPrototypeOf(this, EthereumRPCError.prototype);
  }
}

export class CosmosRPCError extends Error {
  public code: number;

  public id?: string | number;

  public rpcMessage: Record<string, { code: number; message: string }>;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'CosmosRPCError';
    this.code = code;

    const errorMessage = {
      error: {
        code,
        message,
      },
    };

    this.rpcMessage = errorMessage;

    Object.setPrototypeOf(this, CosmosRPCError.prototype);
  }
}

export class AptosRPCError extends Error {
  public code: number;

  public rpcMessage: Record<string, { code: number; message: string }>;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'AptosRPCError';
    this.code = code;

    const errorMessage = {
      error: {
        code,
        message,
      },
    };

    this.rpcMessage = errorMessage;

    Object.setPrototypeOf(this, AptosRPCError.prototype);
  }
}

export class SuiRPCError extends Error {
  public code: number;

  public id?: string | number;

  public rpcMessage: Record<string, { code: number; message: string }>;

  constructor(code: number, message: string, id?: string | number) {
    super(message);
    this.name = 'SuiRPCError';
    this.code = code;
    this.id = id;

    const errorMessage = {
      error: {
        code,
        message,
      },
    };

    this.rpcMessage = errorMessage;

    Object.setPrototypeOf(this, SuiRPCError.prototype);
  }
}

export class IotaRPCError extends Error {
  public code: number;

  public id?: string | number;

  public rpcMessage: Record<string, { code: number; message: string }>;

  constructor(code: number, message: string, id?: string | number) {
    super(message);
    this.name = 'IotaRPCError';
    this.code = code;
    this.id = id;

    const errorMessage = {
      error: {
        code,
        message,
      },
    };

    this.rpcMessage = errorMessage;

    Object.setPrototypeOf(this, IotaRPCError.prototype);
  }
}

export class BitcoinRPCError extends Error {
  public code: number;

  public id?: string | number;

  public rpcMessage: Record<string, { code: number; message: string }>;

  constructor(code: number, message: string, id?: string | number) {
    super(message);
    this.name = 'BitcoinRPCError';
    this.code = code;
    this.id = id;

    const errorMessage = {
      error: {
        code,
        message,
      },
    };

    this.rpcMessage = errorMessage;

    Object.setPrototypeOf(this, SuiRPCError.prototype);
  }
}
export class CommonRPCError extends Error {
  public code: number;

  public id?: string | number;

  public rpcMessage: Record<string, { code: number; message: string }>;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'CommonRPCError';
    this.code = code;

    const errorMessage = {
      error: {
        code,
        message,
      },
    };

    this.rpcMessage = errorMessage;

    Object.setPrototypeOf(this, CommonRPCError.prototype);
  }
}
