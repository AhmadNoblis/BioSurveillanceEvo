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
