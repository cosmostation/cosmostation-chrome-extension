import { ERROR_DESCRIPTION } from './constants';

export class CosmosLedgerError extends Error {
  public errorCode: number;

  constructor(errorCode: number, message?: string) {
    super(message);
    this.errorCode = errorCode;
  }
}

export type CosmosLedgerErrorType = {
  statusCode: number;
};

export function errorCodeToString(statusCode: number) {
  if (statusCode in ERROR_DESCRIPTION) {
    return ERROR_DESCRIPTION[statusCode];
  }
  return `Unknown Status Code: ${statusCode}`;
}

function isDict(v: unknown) {
  return typeof v === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}

type ErrorResponse = {
  return_code: number;
  error_message: string;
};

export function errorResponse(response: CosmosLedgerErrorType): ErrorResponse {
  console.log(response);
  if (response) {
    if (isDict(response)) {
      if (Object.prototype.hasOwnProperty.call(response, 'statusCode')) {
        return {
          return_code: response.statusCode,
          error_message: errorCodeToString(response.statusCode),
        };
      }

      if (
        Object.prototype.hasOwnProperty.call(response, 'return_code') &&
        Object.prototype.hasOwnProperty.call(response, 'error_message')
      ) {
        return response as unknown as ErrorResponse;
      }
    }
    return {
      return_code: 0xffff,
      error_message: response.toString(),
    };
  }

  return {
    return_code: 0xffff,
    error_message: 'Unknown Status',
  };
}
