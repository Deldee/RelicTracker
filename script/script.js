import * as Items from './items.js';
import * as Steps from "./steps.js"
import { Expansions } from './expansions.js';
window.Steps = Steps;
window.Items = Items;
window.getStepsCount = getStepsCount;
window.renderItemIcons = renderItemIcons;


//Take the Id of the expansion (1-6) and return an array of every steps of every row
function getStepsArray(expansion){
    let result= [];
    const table = document.getElementById("tracker");
    for(let row = 1; row < table.rows.length; row++){
        //push the current select index into the array
        result.push(table.rows[row].cells[expansion].getElementsByTagName("select")[0].selectedIndex)
    }
    console.log("Raw array " + result)
    return result;
}

function getStepsCount(expansion){
    let result= []
    const array = getStepsArray(expansion.numericID)
    for(var i = 0; i <= expansion.stepCollection.length; i++){
        result.push(array.filter(v => (v == i)).length)
    }
    console.log("count of each steps : " + result)
    
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
        console.log(currentExpansion);
        getStepsCount(currentExpansion);
    }
});

// Restore on page load
restoreSelects();