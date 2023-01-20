export class CosmosLedgerError extends Error {
  public errorCode: number;

  constructor(errorCode: number, message?: string) {
    super(message);
    this.name = 'CosmosLedgerError';
    this.errorCode = errorCode;

    Object.setPrototypeOf(this, CosmosLedgerError.prototype);
  }
}
