//Take the Id of the expansion (1-6) and return an array of every steps of every row
function getStepsArray(expansion){
    var result= [];
    table = document.getElementById("tracker");
    for(let row = 1; row < table.rows.length; row++){
        //push the current select index into the array
        result.push(table.rows[row].cells[expansion].getElementsByTagName("select")[0].selectedIndex)
    }
    console.log("Raw array " + result)
    return result;
}

function getStepsCount(expansion){
    var result= []
    array = getStepsArray(expansion)
    for(var i = 0; i < 20; i++){
        result.push(array.filter(v => (v == i)).length)
    }
    console.log("count of each steps : " + result)
}






class Currency {
  constructor(name, icon) {
    this.name = name; // string
    this.icon = icon; // url
  }
}

class Cost {
  constructor(currency, value) {
    this.currency = currency; // Currency
    this.value    = value;    // number
  }
}

class Item {
  constructor(name, icon, costs = []) {
    this.name  = name;  // string
    this.icon  = icon;  // url
    this.costs = costs; // Cost[]
  }
};



Thavnairian_Scalepowder = new Item(
    "Thavnairian Scalepowder",
    "",
    [ new Cost(Poetic,250)]
)

Unidentifiable_Bone = new Item(
    "Unidentifiable Bone",
    "",
    [
        new Cost(Poetic, 150),
        new Cost(SteelAmal,3)
    ]
)

Unidentifiable_Shell = new Item(
    "Unidentifiable Bone",
    "",
    [
        new Cost(Poetic, 150),
        new Cost(Rainbowtide_Psashp,3)
    ]
)

Unidentifiable_Ore = new Item(
    "Unidentifiable Bone",
    "",
    [
        new Cost(Poetic, 150),
        new Cost(Titan_Cobaltpiece,3)
    ]
)

Unidentifiable_Seeds = new Item(
    "Unidentifiable Bone",
    "",
    [
        new Cost(Poetic, 150),
        new Cost(Sylphic_Goldleaf,3)
    ]
)


Poetic = new Currency(
    this.name = "Tomestone of Poetics",
    this.icon = "./resources/img/currencyIcon/Allagan_Tomestone_of_Poetics.png"
);

Mathematic = new Currency(
    this.name = "Tomestone of Mathematic",
    this.icon = "./resources/img/currencyIcon/Allagan_Tomestone_of_Mathematics.png"
)

Gil = new Currency (
    this.name = "Gil",
    this.icon = "./resources/img/currencyIcon/Gil.png"
)

SteelAmal = new Currency (
    this.name = "Steel Amalj'ok",
    this.icon = "./resources/img/currencyIcon/Steel_Amalj'ok.png"
)

Sylphic_Goldleaf = new Currency (
    this.name = "Sylphic Goldleaf",
    this.icon = "./resources/img/currencyIcon/Sylphic_Goldleaf.png"
)

Titan_Cobaltpiece = new Currency (
    this.name = "Titan Cobaltpiece",
    this.icon = "./resources/img/currencyIcon/Titan_Cobaltpiece.png"
)

Rainbowtide_Psashp = new Currency (
    this.name = "Rainbowtide Psashp",
    this.icon = "./resources/img/currencyIcon/Rainbowtide_Psashp.png"
)

GCSeals = new Currency (
    this.name = "Grand Company Seals",
    this.icon = "./resources/img/currencyIcon/Company_Seal.png"
)
