// index.js
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const requestIp = require('request-ip');
// const { IPinfoWrapper } = require("node-ipinfo");

dotenv.config();

const app = express();

app.use(requestIp.mw());
const port = process.env.PORT || 3000;


app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';

  const normalizeIp = (ip) => {
  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }
  return ip;
};
  let clientIp = req.clientIp || req.ip;
  clientIp = normalizeIp(clientIp);


  try {
    const locationResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`);
    const location = locationResponse.data.city || 'Unknown location';

    const weatherApiKey = process.env.WEATHER_API_KEY;
    const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${location}`);
    const temperature = weatherResponse.data.current.temp_c;

    const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`;

    res.json({
      client_ip: clientIp,
      location: location,
      greeting: greeting,
    });
  } catch (error) {
    console.error('Error fetching location or weather data:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});