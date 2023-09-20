const express = require('express')
const app = express()
const port = 3001
const PhrasesService = require('./PhrasesService'); 
const service = new PhrasesService();
app.use(express.json()); 

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

app.post('/', (req, res) => {
  const { phrase, location } = req.body;

  console.log(req.body);

  if (!phrase || !location) {
    return res.status(400).json({ error: 'Invalid body'});
  }

  response = service.save(phrase, location);

  res.status(201).json(response);
})


app.listen(port, () => {
  console.log(`Phrases server listening on port ${port}`)
})
