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

export class Item{
  constructor(name,icon){
    this.name = name,
    this.icon = icon
  }
}

export class ShopItem extends Item {
  constructor(name, icon, costs = []) {
    super(name,icon)
    this.costs = costs; // Cost[]
  }
};
