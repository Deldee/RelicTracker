

export class CurrencyAmount {
    constructor(currency, value) {
        this.currency = currency;
        this.value    = value;
    }
}

export class Cost {
    constructor(label, amounts = []) {
        this.label   = label;   // e.g. "Quartermasters's Shop"
        this.amounts = amounts; // CurrencyAmount[]
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

    getMainCost() {
        return this.costs[0] ?? null;
    }

    getAlternateCosts() {
        return this.costs.slice(1);
    }
};


export class Step {
    constructor(entries = []) {
        this.entries = entries; // { item: Item, count: number }[]
    }

  getTotalCosts(count = 1) {
      const shopTotals = {};
      const itemList   = [];

      this.entries.forEach(({ item, count: entryCount }) => {
          if (item instanceof ShopItem) {
              const source = item.getMainSource();

              if (!source || !Array.isArray(source.amounts)) {
                  console.warn(`Item "${item.name}" has an invalid Cost structure`, source);
                  return;
              }

              source.amounts.forEach(({ currency, value }) => {
                  const key = currency.name;

                  if (!shopTotals[key]) {
                      shopTotals[key] = { currency, total: 0 };
                  }

                  shopTotals[key].total += value * entryCount * count;
              });
          } else {
              itemList.push({ item, count: entryCount * count });
          }
      });

      return {
          costs: Object.values(shopTotals),
          items: itemList
      };
  }
}

export function entry(item, count, costIndex = 0) {
    return { item, count, costIndex };
}

export class Expansion {
    constructor(name, abbreviation, numericID, maximumRelics, stepCollection) {
        this.name         = name;
        this.abbreviation = abbreviation;
        this.numericID    = numericID;
        this.maximumRelics = maximumRelics;
        this.stepCollection = stepCollection;
    }
}