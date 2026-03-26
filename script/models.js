

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
  constructor(name,icon,expac="multi"){
    this.name = name,
    this.icon = icon
    this.expac = expac
  }
}

export class ShopItem extends Item {
  constructor(name, icon,expac, costs = []) {
    super(name,icon,expac)
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
        const summary = new CostSummary();
        this.entries.forEach(({ item, count: entryCount }) => {
            summary.addItem(item, entryCount * count);
        });
        return summary;
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

export class CostSummary {
    constructor() {
        this.costs = {}; // keyed by currency name
        this.items = []; // { item, count }[]
    }

    addCurrency(currency, value) {
        const key = currency.name;
        if (!this.costs[key]) {
            this.costs[key] = { currency, total: 0 };
        }
        this.costs[key].total += value;
    }

    addItem(item, count) {
        const existing = this.items.find(e => e.item === item);
        if (existing) {
            existing.count += count;
        } else {
            this.items.push({ item, count });
        }
    }

    add(other) {
        Object.values(other.costs).forEach(({ currency, total }) => {
            this.addCurrency(currency, total);
        });
        other.items.forEach(({ item, count }) => {
            this.addItem(item, count);
        });
        return this; // allows chaining
    }

    getAll() {
        const merged = {};

        // Add shop costs (currencies)
        Object.values(this.costs).forEach(({ currency, total }) => {
            const key = currency.name;
            if (!merged[key]) {
                merged[key] = { item: currency, count: 0 };
            }
            merged[key].count += total;
        });

        // Add non-shop items
        this.items.forEach(({ item, count }) => {
            const key = item.name;
            if (!merged[key]) {
                merged[key] = { item, count: 0 };
            }
            merged[key].count += count;
        });

        return Object.values(merged);
    }

    getCosts() { return Object.values(this.costs); }
    getItems() { return this.items; }
}