// DEPENDENCIES
var cities = [];
var APIKey = "1490c345635df14fe4b2d804e24d8f50";

// WHEN I search for a city
// search for a city and store in local storage
$("#search-city").on("click", function (event) {
  event.preventDefault();
  // get value of city input
  var city = $("#city-input").val();

  var queryURL1 =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=" +
    APIKey;

  // AJAX request
  $.ajax({
    url: queryURL1,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    lat = response.coord.lat;
    lon = response.coord.lon;

    renderCityName(response);
    var weatherIcon = $("<img>");
    var iconCode = response.weather[0].icon;
    var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";
    weatherIcon.attr("src", iconUrl);
    $(".card-title").append(weatherIcon);

    // push city input to cities array
    cities.push(city);
    //store cities in localStorage
    localStorage.setItem("cities", JSON.stringify(cities));

    renderCityList(response, lat, lon);
  });
});

function renderCityName(response) {
  //get current date
  var currentDate = moment().format("L");
  // render city name, current date and weather icon
  $(".card-title").text(`${response.name} (${currentDate})`);
}

function renderCityList(response, lat, lon) {
  var cityItem = $("<li>");
  cityItem.addClass("list-group-item");
  cityItem.text(response.name);
  cityItem.attr("lat", response.coord.lat);
  cityItem.attr("lon", response.coord.lon);
  $("#city-list").prepend(cityItem);

  // When city item is clicked, re render info and forecast
  cityItem.on("click", function () {
    renderCityName(response);
    renderCityInfo(lat, lon);
  });
  //render city info after clicking search button
  renderCityInfo(lat, lon);
}

// WHEN I view current weather conditions for that city
function renderCityInfo(lat, lon) {
  var queryURL2 =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&units=imperial&appid=" +
    APIKey;

  $.ajax({
    url: queryURL2,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    // THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
    $("#temperature").text(`Temperature: ${response.current.temp} \xB0F`);
    $("#humidity").text(`Humidity: ${response.current.humidity}%`);
    $("#wind-speed").text(`Wind Speed: ${response.current.wind_speed} MPH`);
    $("#uv-index").text(`UV Index: `);

    // WHEN I view the UV index
    var uviSpan = $("<span>");
    uviSpan.text(`${response.current.uvi}`);
    // THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
    var uvi = response.current.uvi;
    if (uvi <= 2) {
      uviSpan.addClass("badge badge-success");
    } else if (uvi <= 5) {
      uviSpan.addClass("badge badge-warning");
    } else if (uvi <= 7) {
      uviSpan.addClass("badge");
      uviSpan.css("background-color", "orange");
    } else if (uvi <= 9) {
      uviSpan.addClass("badge badge-danger");
    } else {
      uviSpan.addClass("badge");
      uviSpan.css("background-color", "purple");
      uviSpan.css("color", "white");
    }
    $("#uv-index").append(uviSpan);

    // render 5-Day Forecast
    renderForecast(response);
  });
}

function renderForecast(response) {
  $("#forecast").empty();
  // Render 5-day forecast
  // var n = 5;
  var days = response.daily;
  // get the 2nd - 6th index of the daily array of the response
  days.slice(1, 6).map((day) => {
    var dayCard = $("<div>");
    dayCard.addClass("card col daycard");
    // dayCard.css("width", "18rem");
    dayCard.css("background-color", "lightblue");
    dayCard.css("margin-right", "5px");
    dayCard.css("font-size", "15px");

    var dayCardBody = $("<div>");
    dayCardBody.addClass("card-body");
    dayCard.append(dayCardBody);

    var dayCardName = $("<h6>");
    dayCardName.addClass("card-title");
    console.log(day.dt);
    // take the date of the response object and format it to (MM/DD/YYYY)
    var datestamp = moment.unix(day.dt);
    var forecastDate = datestamp.format("L");
    console.log(forecastDate);
    dayCardName.text(forecastDate);
    dayCardBody.append(dayCardName);

    //take the icon of the response object and set the url to the src of the iconURL
    var weatherIcon = $("<img>");
    var iconCode = day.weather[0].icon;
    var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";
    weatherIcon.attr("src", iconUrl);
    dayCardBody.append(weatherIcon);

    var dayTemp = $("<p>");
    dayTemp.text(`Temp: ${day.temp.max} \xB0F`);
    dayCardBody.append(dayTemp);

    var dayHumidity = $("<p>");
    dayHumidity.text(`Humidity: ${day.humidity}%`);
    dayCardBody.append(dayHumidity);

    $("#forecast").append(dayCard);
  });
}