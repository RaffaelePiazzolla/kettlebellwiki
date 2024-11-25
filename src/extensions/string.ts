declare global {
  interface String {
    capitalize(): string;
    capitalizeFirstLetter(): string;
  }
}

String.prototype.capitalize = function () {
  return this.split(' ').map((word) => {
    return word.capitalizeFirstLetter();
  }).join(' ');
};

String.prototype.capitalizeFirstLetter = function () {
  return this.slice(0, 1).toUpperCase() + this.slice(1);
};

export default {};