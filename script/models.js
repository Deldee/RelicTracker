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


export class Step {
    constructor(entries = []) {
        this.entries = entries; // { item: Item, count: number }[]
    }

  getTotalCosts() {
      const shopTotals = {};
      const itemList   = [];

      this.entries.forEach(({ item, count }) => {
          if (item instanceof ShopItem) {
              item.costs.forEach(cost => {
                  const currencyName = cost.currency.name;

                  if (!shopTotals[currencyName]) {
                      shopTotals[currencyName] = { currency: cost.currency, total: 0 };
                  }

                  shopTotals[currencyName].total += cost.value * count;
              });
          } else {
              itemList.push({ item, count });
          }
      });

      return {
          costs: Object.values(shopTotals),
          items: itemList
      };
  }
}

export function entry(item, count) {
    return { item, count };
}