const apiUrl = "https://thecocktaildb.com/api/json/v1/1/randomselection.php";
let el = document.getElementById("random");


export async function getApiData() {
    const response = await fetch(apiUrl);
    const json = await response.json();
    let newHTML = `
        <img src="${json.drinks[0].strDrinkThumb}">
    `;
    el.innerHTML = newHTML;
}

getApiData();