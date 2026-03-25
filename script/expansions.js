import { Expansion } from './models.js';
import { ARRSteps,HWSteps,SBSteps,ShBteps,EWSteps,DTSteps } from './steps.js';

export const ARealmReborn      = new Expansion("A Realm Reborn","ARR",      1, 10,ARRSteps);
export const Heavensward       = new Expansion("Heavensward","HW",         2, 13,HWSteps);
export const Stormblood        = new Expansion("Stormblood","SB",          3, 15,SBSteps);
export const Shadowbringers    = new Expansion("Shadowbringers","ShB",      4, 17,ShBteps);
export const Endwalker         = new Expansion("Endwalker","EW",           5, 19,EWSteps);
export const Dawntrail         = new Expansion("Dawntrail","DT",           6, 21,DTSteps);

export const Expansions = [
    ARealmReborn,
    Heavensward,
    Stormblood,
    Shadowbringers,
    Endwalker,
    Dawntrail
    
];