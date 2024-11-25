export default class Product {
  id: number;
  name: string;
  pricePerMonth: number;
  description: string;

  constructor({ id, description, pricePerMonth, name }: ProductConstructor = {}) {
    this.setProps({ id, description, pricePerMonth, name });
  }

  setProps({ id, description, pricePerMonth, name }: ProductConstructor = {}) {
    if (id != null) this.id = id;
    if (name != null) this.name = name;
    if (pricePerMonth != null) this.pricePerMonth = pricePerMonth;
    if (description != null) this.description = description;
  }
}

interface ProductConstructor {
  id?: number;
  name?: string;
  pricePerMonth?: number;
  description?: string;
}