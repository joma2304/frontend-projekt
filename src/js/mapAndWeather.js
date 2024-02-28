'use strict';
//Karta
// Variabel för kartan globalt
let map = L.map('mapid').setView([62.0, 15.0], 5);

// Lägg till en OpenStreetMap-tile layer till kartan
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

/* map control, hitta din plats */
L.control.locate().addTo(map);

// Sökfunktion för kartan
async function search() {
    // Dölj felmeddelandet när en ny sökning görs
    document.getElementById('errorMessages').innerHTML = ''; // Tömmer innehållet i errorMessages elementet

    let query = document.getElementById('searchInput').value;   //Hämtar input i sökfält
    if (query.length > 0) {
        try {
            // Rensa tidigare sökresultat
            map.eachLayer(function (layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            const response = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query));
            const data = await response.json();
            if (data.length > 0) {      //Kollar efter resultat i sökningen
                let lat = parseFloat(data[0].lat);  //Latitud
                let lon = parseFloat(data[0].lon);  //Longitud
                map.setView([lat, lon], 10); // Sätt ny vy till platsen med zoomnivå 10
                L.marker([lat, lon]).addTo(map); // Lägg till en markör på platsen
            } else {
                alert('Platsen hittades inte.'); //Ifall plats ej hittas
            }
        } catch (error) {
            console.error('Något gick fel:', error); //Om error
        }
    } else {
        alert('Ange en plats att söka efter.'); //Ifall sökfält är tomt
    }
}

// Söknappen för kartan
document.getElementById('searchButton').addEventListener('click', search); //Eventlistner för sökknapp

// Så att man kan söka på enter med
document.getElementById('searchInput').addEventListener('keydown', function(event) {
    // Kontrollera om den nedtryckta tangenten är Enter (key code 13)
    if (event.keyCode === 13) {
        search(); // Anropa sökfunktionen om Enter trycks ned
    }
});

// Väderfunktion
async function searchWeather() {
    let query = document.getElementById('searchInput').value;
    if (query.length > 0) { //Kollar efter resultat i sökningen
        try {
            const weatherData = await getWeatherData(query);
            if (weatherData) {
                // Exempel på man du kan använda väderdata jag kan lägga till mer eller mindre sen
                const temperature = weatherData.main.temp; //Variabel för grader
                const weatherIcon = weatherData.weather[0].icon; //Variabel för vädericon
                const weatherDescription = weatherData.weather[0].description; //Variabel för väderbeskrivning
                const cityName = weatherData.name //Variabel för stadens namn
                
                // Skapa en sträng för popup-innehållet
                const popupContent = `${cityName}<br>Temperatur: ${temperature}°C<br>Väder: ${weatherDescription}<br> <img src="http://openweathermap.org/img/wn/${weatherIcon}.png">`;

                // Hämta koordinaterna för platsen
                const lat = parseFloat(weatherData.coord.lat);
                const lon = parseFloat(weatherData.coord.lon);

                // Skapa en popup och lägg till den på kartan vid platsens koordinater
                L.popup()
                    .setLatLng([lat, lon])
                    .setContent(popupContent)
                    .openOn(map);
            } else {
                alert('Kunde inte hämta väderinformation.'); // Annars visa detta som alert
            }
        } catch (error) {
            console.error('Något gick fel vid hämtning av väderinformation:', error);
            document.getElementById('errorMessages').innerHTML += '<p>Väderinformation kunde inte hämtas, kontrollera stavning eller testa en annan plats!</p>'; //Vid fel med väderhämtning skriv ut detta på webbplatsen
        }
    } else {
        return null; //Så att det inte blir dubbla alert
    }
}


// Lägg till en händelselyssnare för sökknappen för väder
document.getElementById('searchButton').addEventListener('click', searchWeather);

// Så att man kan söka på enter med
document.getElementById('searchInput').addEventListener('keydown', function(event) {
    // Kontrollera om den nedtryckta tangenten är Enter (key code 13)
    if (event.keyCode === 13) {
        searchWeather(); // Anropa vädersökningsfunktionen om Enter trycks ned
    }
});

// API-nyckel för OpenWeatherMap
const apiKey = '04383bd1eb5fe54d4bdb8768276ceb9d';

// Funktion för att hämta väderdata för en given stad
async function getWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=sv`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
} 

