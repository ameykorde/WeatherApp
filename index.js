// Function to get weather data by user location

$(".allow-location").click(() => {
  const success = async (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const data = await weatherData(latitude, longitude);
    weatherForecast = getDailyForecast(data.name);
    displayData(data, weatherForecast);
  }
  navigator.geolocation.getCurrentPosition(success);
})

const weatherData = async (lat, lon) => {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=c8193b9285ee3a8d49d0b678b6937cac&units=metric`);
  const data = await response.json();
  return data;
}



$("form").submit(async (e) => {
  e.preventDefault();
  const cityName = $("input").val()
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=c8193b9285ee3a8d49d0b678b6937cac&units=metric`);
  const data = await response.json();
  if (data.cod == 200) {
    $(".error-message").remove();
    weatherForecast = getDailyForecast(data.name);
    displayData(data, weatherForecast);
  } else {
    // Remove any existing error message
    $(".error-message").remove();

    // Show error message to user
    $("form").after(
      `<p class="error-message">Invalid city name</p>`
    );
  }
});


const getDailyForecast = async (city) => {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=c8193b9285ee3a8d49d0b678b6937cac&units=metric`);
  const weatherData = await response.json();
  // Create an object to store the grouped data
  let groupedData = {};

  // Loop through the list and group the data by date
  for (let i = 0; i < weatherData.list.length; i++) {
    let data = weatherData.list[i];
    let date = data.dt_txt.split(' ')[0]; // Extract the date part of the date time string

    // If the date is not yet in the groupedData object, create a new entry
    if (!groupedData[date]) {
      groupedData[date] = {
        weatherIcon: null, // Variable to store the selected weather icon of the day
        cloudCondition: null // Variable to store the cloud condition of the day
      };
    }

    // If the weatherIcon of the current date is not yet set, set it to the icon of the current data
    if (!groupedData[date].weatherIcon) {
      groupedData[date].weatherIcon = data.weather[0].icon;
    }

    // If the cloudCondition of the current date is not yet set, set it to the main cloud condition of the current data
    if (!groupedData[date].cloudCondition) {
      groupedData[date].cloudCondition = data.weather[0].main;
    }
  }
  return groupedData;
}


// Displaying Data

const displayData = async (data, weatherForecast) => {

  $("#left").removeClass("left-info-before")
  $("#left").addClass("left-info-after");
  const temperature = Math.floor(data.main.temp);
  const city = data.name;
  let clouds = data.weather[0].main;

  if (temperature < 0) {
    $("body").css("background-image", "url('images/snow.jpg')");
  }

  else if (clouds == 'Clear') {
    $("body").css("background-image", "url('images/clearSky.jpg')");
    $(".box").css("background", "rgba(0, 0, 0, .5)");
  }

  else if (clouds == 'Clouds') {
    $("body").css("background-image", "url('images/cloud.jpg')");
  }

  else if (clouds == 'Rain') {
    $("body").css("background-image", "url('images/rain.jpg')");
  }
  else {
    $("body").css("background-image", "url('images/cloud.jpg')");

  }

  const icon = data.weather[0].icon;
  const url = `https://openweathermap.org/img/wn/${icon}@2x.png`

  $(".left-container ").html(
    `
    <div class="temperature">
    <h1 class="degree">${temperature}°</h1>
    <div class="city">
    <h1>${city}</h1>
    
    </div>
    <div class="cloud">
    <img src="${url}">
    <h5>${clouds}</h5>
    </div>
    </div>
    `
  );


  const feelsLike = data.main.feels_like;
  const humidity = data.main.humidity;
  const pressure = data.main.pressure;
  const windSpeed = data.wind.speed;

  // Add the weather details HTML
  $(".weather-details").html(
    `
        <h5>Weather Details</h5>
        <div class="weather-details-info">
          <h6>Feels Like</h6>
          <h6>${feelsLike}°</h6>
        </div>
        <div class="weather-details-info">
          <h6>Humidity</h6>
          <h6>${humidity}%</h6>
        </div>
        <div class="weather-details-info">
          <h6>Wind Speed</h6>
          <h6>${windSpeed}</h6>
        </div>
        <div class="weather-details-info">
        <h6>Pressure</h6>
        <h6>${pressure}hPa</h6>
        </div>
        `
  );
  $(".forecast-detail").show();

  $(".daily-forecast").html(`
      <button type="button" class="btn btn-dark daily-forecast-button">Week Forecast</button
    `)

  // Hide the weather details if the forecast is already visible
  if ($(".forecast-detail").is(":visible")) {
    $(".forecast-detail").slideToggle(650, () => {
      $(".weather-details").slideToggle(650);
    });
  }

  // Show the daily forecast if it is currently hidden
  const groupedData = await weatherForecast;
  for (let date in groupedData) {
    const clouds = groupedData[date].cloudCondition;
    const weatherIcon = groupedData[date].weatherIcon;
    const url = `https://openweathermap.org/img/wn/${weatherIcon}.png`;
    const dateObj = new Date(date);
    const day = dateObj.toLocaleDateString("en-US", { weekday: 'long' });
    const displayDate = dateObj.toLocaleDateString("en-US", { day: '2-digit', month: 'short' });
    $(".daily-forecast").append(`
    <div class="forecast-detail">
          <div class="forecast-detail-data">
          <div class="d-flex flex-column mt-3">
              <h6>${day}</h6>
              <h6>${displayDate}</h6>
              </div>
              <div class="justify-content-end">
              <img src="${url}">
              <h6>${clouds}</h6>
              </div>
              </div>
              </div>
              `)

    $(".forecast-detail").hide();
  }

  
}
$(document).on("click", ".daily-forecast-button", async () => {
  $(".weather-details").slideToggle(650);
  $(".forecast-detail").animate({
    opacity: "toggle"
  }, 650);
});
