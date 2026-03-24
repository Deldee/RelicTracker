import * as currencies from './currencies.js'
import * as Items from "./items.js"
import { Item, Step ,entry } from './models.js'


export const BaseARR = new Step([
    entry(Items.Radz_at_Han_Quenching_Oil,1)
])

export const ZenithARR = new Step([
    entry(Items.Thavnairian_Mist,3)
])

export const AtmaARR = new Step([

    entry(Items.Atma_of_the_Lion,1),
    entry(Items.Atma_of_the_Water_bearer,1),
    entry(Items.Atma_of_the_Ram,1),
    entry(Items.Atma_of_the_Crab,1),
    entry(Items.Atma_of_the_Fish,1),
    entry(Items.Atma_of_the_Bull,1),
    entry(Items.Atma_of_the_Scales,1),
    entry(Items.Atma_of_the_Twins,1),
    entry(Items.Atma_of_the_Scorpion,1),
    entry(Items.Atma_of_the_Archer,1),
    entry(Items.Atma_of_the_Goat,1),
    entry(Items.Atma_of_the_Maiden,1)
])

export const AnimusARR = new Step([
    entry(Items.Book_of_The_Braves,9)
])

export const NovusARR = new Step([
    entry(Items.Superior_Enchanted_Ink,3),
    entry(Items.Alexandrite,75)
])

export const NexusARR = new Step([
])

export const BravesARR = new Step([
    entry(Items.Bombard_Core,4),
    entry(Items.Sacred_Spring_Water,4),
    entry(Items.Furite_Sand,1),
    entry(Items.Allagan_Resin,1),
    entry(Items.Bronze_Lake_Crystal,1),
    entry(Items.Brass_Kettle,1),
    entry(Items.Perfect_Cloth,1),
    entry(Items.Perfect_Firewood,1),
    entry(Items.Perfect_Mortar,1),
    entry(Items.Perfect_Pestle,1),
    entry(Items.Perfect_Pounce,1),
    entry(Items.Perfect_Vellum,1),
    entry(Items.Tailor_made_Eel_Pie,1),
    entry(Items.Furnace_Ring,1)

])

export const ZetaARR = new Step([
])

export const AnimatedHW = new Step([
    entry(Items.Astral_Nodule,1),
    entry(Items.Umbral_Nodule,1)
])

export const AwokenHW = new Step([
    entry(Items.Astral_Nodule,1)
])

export const AnimaHW = new Step([
    entry(Items.Unidentifiable_Bone,10),
    entry(Items.Unidentifiable_Ore,10),
    entry(Items.Unidentifiable_Seeds,10),
    entry(Items.Unidentifiable_Shell,10),
    entry(Items.Kingcake,4),
    entry(Items.Adamantite_Francesca,4),
    entry(Items.Dispelling_Arrow,4),
    entry(Items.Titanium_Alloy_Mirror,4),
])

export const HyperconductiveHW = new Step([
    entry(Items.Aether_Oil,5),
])

export const ReconditionedHW = new Step([
    entry(Items.Umbrite,60)
    //TODO Add Crystal Sand 
])

export const SharpenedHW = new Step([
    entry(Items.Singing_Cluster,50)
])

export const CompleteHW = new Step([
    entry(Items.Pneumite,15)
])

export const LuxHW = new Step([
    entry(Items.Archaic_Enchanted_Ink,1)
])

