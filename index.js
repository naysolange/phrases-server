const express = require('express');
const cors = require('cors');
const axios = require('axios');
const UAParser = require('ua-parser-js');
const PhrasesService = require('./PhrasesService'); 
require('dotenv').config();
const hostname = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 5001; 
const app = express();
const service = new PhrasesService();

app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('I am alive!');
});

app.use(cors({
  origin: 'https://quiensosahora.github.io'
}));

app.get('/:amount', async (req, res) => { 
  const amount = parseInt(req.params.amount);
  try {
    const response = await service.get(amount);
    
    if (response.length === 0) {
      return res.status(400).json({ error: 'There are no phrases'});
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
 });

app.post('/', async (req, res) => {
  const { phrase } = req.body;
  let locationInfo; 
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  try {
    const response = await axios.get(`https://ipinfo.io/${clientIP}/json`);
    
    locationInfo = {
      city: response.data.city,
      region: response.data.region,
      country: response.data.country,
      loc: response.data.loc
    };
  } catch (error) {
    console.error(error);
    locationInfo = {
      city: "unknown",
      country: "unknown",
      loc: "unknown"
    };
  }

  const userAgent = req.get('User-Agent');
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const deviceInfo = {
    browser: result.browser.name,
    browser_version: result.os.version,
    os: result.os.name,
    os_version: result.os.version,
    device_model: result.device.model,
    device_type: result.device.type,
    device_vendor: result.device.vendor
  };

  if (!phrase) {
    return res.status(400).json({ error: 'Invalid body'});
  }

  try {
    const response = await service.save(phrase, locationInfo, deviceInfo);
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Phrases server running at http://${hostname}:${port}/`);
});
