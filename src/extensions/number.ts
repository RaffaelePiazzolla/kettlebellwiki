declare global {
  interface Number {
    between(from: number, to: number, inclusive?: boolean): boolean;
    isIn(numbers: number[]): boolean;
  }
}

Number.prototype.between = function (from: number, to: number, inclusive: boolean = true) {
  return inclusive ? from <= this && this <= to : from < this && this < to;
};

Number.prototype.isIn = function (numbers: number[]): boolean {
  return numbers.reduce<boolean>((acc, cur) => acc || this == cur, false);
};

export default {};