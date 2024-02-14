const express = require('express');
const cors = require('cors');
const axios = require('axios');
const UAParser = require('ua-parser-js');
const PhrasesService = require('./PhrasesService'); 
const hostname = "0.0.0.0";
const port = process.env.port || 5001;
const app = express();
const service = new PhrasesService();
app.use(express.json()); 
app.use(cors()); 

app.get('/', (req, res) => {
  res.send('I am alive!');
})

app.get('/:amount', (req, res) => {
  const amount = parseInt(req.params.amount);

  const response = service.get(amount);

  if (response.length == 0) {
    return res.status(400).json({ error: 'There are no phrases'});
  }

  res.status(200).json(response);
});

app.post('/', async (req, res) => {
  const { phrase } = req.body;
  var locationInfo; 

  // Get city by ip
  try {
    const response = await axios.get(`https://ipinfo.io/${req.ip}/json`);
    locationInfo = {
      city: response.data.city,
      country: response.data.country,
      loc: response.data.loc
    };
   
  } catch (error) {
    locationInfo = {
      city: "unknown",
      country: "unknown",
      loc: "unknown"
    };
    console.error(error);
  }

  // Get device from agent
  const userAgent = req.get('User-Agent');
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const deviceInfo = {
    browser: result.browser.name,
    browser_version: result.os.version,
    os: result.os.name,
    os_version: result.os.version,
    device: result.device
  };

  if (!phrase) {
    return res.status(400).json({ error: 'Invalid body'});
  }

  response = service.save(phrase, locationInfo, deviceInfo);

  res.status(201).json(response);
})


app.listen(port, () => {
  console.log(`Phrases server running at http://${hostname}:${port}/`);
})
