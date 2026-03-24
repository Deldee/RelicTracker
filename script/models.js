export class Currency {
  constructor(name, icon) {
    this.name = name; // string
    this.icon = icon; // url
  }
}

export class Cost {
  constructor(currency, value) {
    this.currency = currency; // Currency
    this.value    = value;    // number
  }
}

export class Item {
  constructor(name, icon, costs = []) {
    this.name  = name;  // string
    this.icon  = icon;  // url
    this.costs = costs; // Cost[]
  }
};