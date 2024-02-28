const express = require('express');
const dotenv = require('dotenv');
const openai = require('openai');
const logger = require('morgan');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const secretKey = process.env['OPENAI_SECRET_KEY']

// Initialize OpenAI client
const openaiClient = new openai({apiKey: secretKey});

// Error handling middleware
app.use(express.json());
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function gpt4Vision(imageUrl, prompt) {
  console.log('AI call')
  try {
    const response = await await openaiClient.chat.completions.create({
      model: 'gpt-4-vision-preview',  // Adjust model name if needed
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0];
  } catch (error) {
    throw new Error(`Error calling GPT-4-vision: ${error.message}`);
  }
}

app.get('/analyze-image', (req, res) => {
  res.json({ message: 'Welcome to the image analysis API!' });
});

app.post('/analyze-image', async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'No image URL provided' });
    }

    const analysis = await gpt4Vision(imageUrl, prompt);
    res.json({ analysis });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
