export class DbRecordNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DbRecordNotFoundError';
  }
}

export class DbOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DbOperationError';
  }
}
