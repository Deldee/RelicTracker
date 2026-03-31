

export class CurrencyAmount {
    constructor(currency, value) {
        this.currency = currency;
        this.value = value;
    }
}

export class Cost {
    constructor(label, amounts = []) {
        this.label = label;   // e.g. "Quartermasters's Shop"
        this.amounts = amounts; // CurrencyAmount[]
    }
}
export class Source {
    constructor(type, label, amounts = []) {
        this.type = type;
        this.label = label;
        this.amounts = amounts; // CurrencyAmount[] — empty if no cost

        switch (type) {
            case "Fate":
                this.icon = "./resources/img/contentIcon/60722.png";
                break;
            case "NM":
                this.icon = "./resources/img/contentIcon/607852.png";
                break;
            case "Quest":
                this.icon = "./resources/img/contentIcon/Quest_icon.png";
                break;
            case "Duty":
                this.icon = "./resources/img/contentIcon/Dungeon.png";
                break;
            case "Shop":
                this.icon = "./resources/img/contentIcon/Shop.png";
                break;
            default:
                this.icon = null;
                break;
        }
    }

    hasCost() {
        return this.amounts.length > 0;
    }
}

export class Item {
    constructor(name, icon, expac = "multi", sources = []) {
        this.name = name;
        this.icon = icon;
        this.expac = expac;
        this.sources = sources; // Source[]
    }

    hasCost() {
        return this.sources.some(s => s.hasCost());
    }

    getMainSource() {
        return this.sources[0] ?? null;
    }

    getAlternateSources() {
        return this.sources.slice(1);
    }

    getSources() {
        return this.sources.filter(s => !s.hasCost());
    }
}


export class Step {
    constructor(entries = []) {
        this.entries = entries; // { item: Item, count: number }[]
    }

    getTotalCosts(count = 1) {
        const summary = new CostSummary();
        this.entries.forEach(({ item, count: entryCount }) => {
            if (item.hasCost()) {
                const source = item.getMainCost();
                if (!source || !Array.isArray(source.amounts)) {
                    console.warn(`Item "${item.name}" has an invalid Cost structure`, source);
                    return;
                }
                source.amounts.forEach(({ currency, value }) => {
                    summary.addCurrency(currency, value * entryCount * count);
                });
                summary.addItem(item, entryCount * count);
            } else {
                summary.addItem(item, entryCount * count);
            }
        });
        return summary;
    }
}

export function entry(item, count, costIndex = 0) {
    return { item, count, costIndex };
}

export class Expansion {
    constructor(name, abbreviation, numericID, maximumRelics, stepCollection) {
        this.name = name;
        this.abbreviation = abbreviation;
        this.numericID = numericID;
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