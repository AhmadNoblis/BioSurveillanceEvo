const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors());

app.post('/add-prompt', (req, res) => {
  const { type, value } = req.body; // Assuming you send type and value
  const filePath = path.join(__dirname, 'prompts.json'); // Use path.join for reliable file path

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error reading the file' });
      return;
    }
    
    let prompts;
    try {
      prompts = JSON.parse(data.toString());
    } catch (e) {
      console.error('Error parsing JSON:', e);
      res.status(500).json({ error: 'Error parsing JSON' });
      return;
    }
    
    if(type === 'prompt') {
      prompts.prompts.push(value);
    } else if(type === 'disease') {
      prompts.specificDiseases.push(value);
    } else if(type === 'region/country') {
      prompts.specificRegionsCountries.push(value);
    }

    fs.writeFile(filePath, JSON.stringify(prompts, null, 2), 'utf8', (err) => {
      if (err) {
        res.status(500).send('Error updating the file');
        return;
      }
      res.send({ success: true });
    });
  });
});
// POST endpoint to save selected options

app.post('/save-selected-prompts', (req, res) => {
  const data = req.body;

  // Path where the selected_prompts.json will be saved
  const filePath = path.join(__dirname, 'selected_prompts.json');

  // Write the data to a file
  fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error saving the selected prompts:', err);
      res.status(500).send('Error saving the data');
    } else {
      console.log('Selected prompts saved successfully!');
      res.json({ message: 'Data saved successfully' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
