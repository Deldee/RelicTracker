import { Item, Cost }                          from './models.js';
import * as currencies from './currencies.js'

export const Thavnairian_Scalepowder = new Item(
    "Thavnairian Scalepowder",
    "",
    [ new Cost(currencies.Poetic,250)]
)

export const Unidentifiable_Bone = new Item(
    "Unidentifiable Bone",
    "",
    [
        new Cost(currencies.Poetic, 150),
        new Cost(currencies.SteelAmal,3)
    ]
)

export const Unidentifiable_Shell = new Item(
    "Unidentifiable Bone",
    "",
    [
        new Cost(currencies.Poetic, 150),
        new Cost(currencies.Rainbowtide_Psashp,3)
    ]
)

export const Unidentifiable_Ore = new Item(
    "Unidentifiable Bone",
    "",
    [
        new Cost(currencies.Poetic, 150),
        new Cost(currencies.Titan_Cobaltpiece,3)
    ]
)

export const Unidentifiable_Seeds = new Item(
    "Unidentifiable Bone",
    "",
    [
        new Cost(currencies.Poetic, 150),
        new Cost(currencies.Sylphic_Goldleaf,3)
    ]
)

export const Adamantite_Francesca = new Item(
    "Adamantite Francesca",
    "",
    [
        new Cost(currencies.GCSeals, 5000),
    ]
)

export const Titanium_Alloy_Mirror = new Item(
    "Titanium Alloy Mirror",
    "",
    [
        new Cost(currencies.GCSeals, 5000),
    ]
)

export const Dispelling_Arrow = new Item(
    "Dispelling Arrow",
    "",
    [
        new Cost(currencies.GCSeals, 5000),
    ]
)

export const Kingcake = new Item(
    "Kingcake",
    "",
    [
        new Cost(currencies.GCSeals, 5000),
    ]
)
