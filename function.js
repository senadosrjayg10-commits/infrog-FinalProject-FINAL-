// Initial setup for the application
document.addEventListener('DOMContentLoaded', () => {
	const cityForm = document.querySelector('.cityForm');
	const cityInput = document.querySelector('.cityName');
	const result = document.querySelector('.result1');

	cityForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const city = cityInput.value.trim();
		result.innerHTML = 'Loading...';
		try {
			let lat, lon, name;
			if (city) {
				// Use Open-Meteo geocoding (no API key)
				const geoRes = await fetch(
					`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
				);
				const geoJson = await geoRes.json();
				if (!geoJson.results || geoJson.results.length === 0) {
					result.innerHTML = `City "${city}" not found. Try another name or allow location.`;
					return;
				}
				lat = geoJson.results[0].latitude;
				lon = geoJson.results[0].longitude;
				name = `${geoJson.results[0].name}${geoJson.results[0].country ? ', ' + geoJson.results[0].country : ''}`;
			} else if (navigator.geolocation) {
				// If no city provided, try browser geolocation
				const pos = await new Promise((resolve, reject) =>
					navigator.geolocation.getCurrentPosition(resolve, reject)
				);
				lat = pos.coords.latitude;
				lon = pos.coords.longitude;
				name = 'Your location';
			} else {
				result.innerHTML = 'No city provided and geolocation unavailable.';
				return;
			}

			// Fetch current weather from Open-Meteo (no API key)
			const weatherRes = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
			);
			const weatherJson = await weatherRes.json();
			if (!weatherJson.current_weather) {
				result.innerHTML = 'Weather information unavailable for that location.';
				return;
			}
			const cw = weatherJson.current_weather;
			const desc = weatherCodeToText(cw.weathercode);

			result.innerHTML = `
				<div class="weatherCard">
					<h2>${name}</h2>
					<p><strong>Temperature:</strong> ${cw.temperature} °C</p>
					<p><strong>Wind:</strong> ${cw.windspeed} km/h, direction ${cw.winddirection}°</p>
					<p><strong>Condition:</strong> ${desc}</p>
					<p><small>Timestamp: ${cw.time}</small></p>
				</div>
			`;
		} catch (err) {
			console.error(err);
			result.innerHTML = 'Error fetching weather: ' + (err.message || err);
		}
	});

	function weatherCodeToText(code) {
		const map = {
			0: 'Clear sky',
			1: 'Mainly clear',
			2: 'Partly cloudy',
			3: 'Overcast',
			45: 'Fog',
			48: 'Depositing rime fog',
			51: 'Light drizzle',
			53: 'Moderate drizzle',
			55: 'Dense drizzle',
			56: 'Light freezing drizzle',
			57: 'Dense freezing drizzle',
			61: 'Slight rain',
			63: 'Moderate rain',
			65: 'Heavy rain',
			66: 'Light freezing rain',
			67: 'Heavy freezing rain',
			71: 'Slight snow fall',
			73: 'Moderate snow fall',
			75: 'Heavy snow fall',
			77: 'Snow grains',
			80: 'Slight rain showers',
			81: 'Moderate rain showers',
			82: 'Violent rain showers',
			85: 'Slight snow showers',
			86: 'Heavy snow showers',
			95: 'Thunderstorm',
			96: 'Thunderstorm with slight hail',
			99: 'Thunderstorm with heavy hail'
		};
		return map[code] || 'Unknown';
	}
});
nyaaaa