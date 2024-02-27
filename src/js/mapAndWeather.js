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

// Väderfunktion
async function searchWeather() {
    let query = document.getElementById('searchInput').value;
    if (query.length > 0) {
        try {
            const weatherData = await getWeatherData(query);
            if (weatherData) {
                // Exempel på hur du kan använda väderdata
                const temperature = weatherData.main.temp;
                const weatherDescription = weatherData.weather[0].description;

                // Skapa en sträng för popup-innehållet
                const popupContent = `Temperature: ${temperature}°C<br>Weather: ${weatherDescription}`;

                // Hämta koordinaterna för platsen
                const lat = parseFloat(weatherData.coord.lat);
                const lon = parseFloat(weatherData.coord.lon);

                // Skapa en popup och lägg till den på kartan vid platsens koordinater
                L.popup()
                    .setLatLng([lat, lon])
                    .setContent(popupContent)
                    .openOn(map);
            } else {
                alert('Kunde inte hämta väderinformation.');
            }
        } catch (error) {
            console.error('Något gick fel vid hämtning av väderinformation:', error);
            document.getElementById('errorMessages').innerHTML += '<p>Väderinformation kunde inte hämtas, kontrollera stavning eller testa en annan plats!</p>';
        }
    } else {
        alert('Ange en plats att söka efter.');
    }
}


// Lägg till en händelselyssnare för sökknappen för väder
document.getElementById('searchButton').addEventListener('click', searchWeather);

// API-nyckel för OpenWeatherMap
const apiKey = '04383bd1eb5fe54d4bdb8768276ceb9d';

// Funktion för att hämta väderdata för en given stad
async function getWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

