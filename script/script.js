import * as Items from './items.js';
import * as Steps from "./steps.js"
import { Expansions } from './expansions.js';
import { CostSummary } from './models.js';


const totals = {};
const log = false

//Expose for debugging
window.Expansions = Expansions;
window.CostSummary = CostSummary;
window.Steps = Steps;
window.Items = Items;
window.getStepsCount = getStepsCount;
window.renderItemIcons = renderItemIcons;
window.calculateTotalCosts = calculateTotalCosts;
window.getAllTotals =  getAllTotals;
window.totals = totals;


//Take the Id of the expansion (1-6) and return an array of every steps of every row
function getStepsArray(expansion){
    let result = [];
    const table = document.getElementById("tracker");
    for(let row = 1; row < table.rows.length; row++){
        const select = table.rows[row].cells[expansion].getElementsByTagName("select")[0];
        if (select.classList.contains("disabled")) continue;
        result.push(select.selectedIndex);
    }
    return result;
}

function getStepsCount(expansion){
    let result= []
    const array = getStepsArray(expansion.numericID)
    for(var i = 0; i <= expansion.stepCollection.length; i++){
        result.push(array.filter(v => (v == i)).length)
    }
    
    return result;
}


// Get icon from an items and set it
function renderItemIcons(Items) {
    Object.values(Items).forEach(item => {
        const img = document.createElement("img");
        img.src = item.icon;
        img.alt = item.name;
        document.body.appendChild(img);
    });
}

//Cookies
function getSelectIndexes() {
    const selects = document.querySelectorAll("select");
    return Array.from(selects).map(select => select.selectedIndex);
}
function saveSelectsToCookie() {
    const indexes = getSelectIndexes();
    document.cookie = `relicTrack=${JSON.stringify(indexes)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}
function loadSelectsFromCookie() {
    const match = document.cookie.split("; ").find(row => row.startsWith("relicTrack="));
    if (!match) return null;
    return JSON.parse(match.split("=")[1]);
}
function restoreSelects() {
    const indexes = loadSelectsFromCookie();
    if (!indexes) return;

    const selects = document.querySelectorAll("select");
    selects.forEach((select, i) => {
        if (indexes[i] !== undefined) {
            select.selectedIndex = indexes[i];
        }
    });
}

// Save whenever any select changes
document.addEventListener("change", (e) => {
    if (e.target.tagName === "SELECT") {
        saveSelectsToCookie();

        const currentExpansion = Expansions.find(exp => e.target.classList.contains(exp.abbreviation));
        updateExpansionTotal(currentExpansion);
    }
});

//Totals
function calculateTotalCosts(currentExpansion) {
    const l = (...args) => log && console.log(...args);
    const lg = (label) => log && console.group(label);
    const lge = () => log && console.groupEnd();

    const stepsArray = getStepsCount(currentExpansion);
    const total = new CostSummary();
    let remainingRelics = currentExpansion.maximumRelics;

    lg(`calculateTotalCosts — ${currentExpansion.name}`);
    l("Steps array:", stepsArray);
    l("Starting relics:", remainingRelics);

    for (let i = stepsArray.length - 1; i > 0; i--) {
        remainingRelics -= stepsArray[i];
        lg(`Step [${i}]`);
        l("Raw value:        ", stepsArray[i]);
        l("Remaining relics: ", remainingRelics);

        if (remainingRelics <= 0) {
            l("→ No relics remaining, exiting loop");
            lge();
            break;
        }

        l("→ After subtracting step:", remainingRelics);
        total.add(currentExpansion.stepCollection[i - 1].getTotalCosts(remainingRelics));
        l("→ Current total:", total.getAll());
        lge();
    }

    l("Final total:", total.getAll());
    lge();

    return total;
}
function updateExpansionTotal(expansion) {
    totals[expansion.numericID] = calculateTotalCosts(expansion);
}
function updateAllTotals() {
    Expansions.forEach(expansion => updateExpansionTotal(expansion));
}
function getAllTotals() {
    const combined = new CostSummary();
    Object.values(totals).forEach(expansionTotal => {
        combined.add(expansionTotal);
    });
    return combined;
}

// Restore on page load
restoreSelects();
updateAllTotals();