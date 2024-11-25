declare global {
  interface Date {
    toMySQLDate(): string;
    toMySQLDateTime(): string;
  }
}

Date.prototype.toMySQLDate = function (): string {
  return this.toJSON().slice(0, 10);
};

Date.prototype.toMySQLDateTime = function (): string {
  return this.toJSON().slice(0, 19).replace('T', ' ');
};

export default {};