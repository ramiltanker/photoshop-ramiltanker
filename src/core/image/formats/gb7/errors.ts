export class Gb7FormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Gb7FormatError';
  }
}
