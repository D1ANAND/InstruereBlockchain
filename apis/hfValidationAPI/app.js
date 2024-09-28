const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');  // Import CORS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Endpoint to check Hugging Face model
app.get('/check_model', async (req, res) => {
    const repo_id = req.query.repo_id;
    const api_token = process.env.HF_API;  // Load API token from environment
    const revision = req.query.revision;

    if (!repo_id) {
        return res.status(400).json({ error: "repo_id parameter is required" });
    }

    let url = `https://huggingface.co/api/models/${repo_id}`;
    
    if (revision) {
        url += `/revision/${revision}`;
    }

    const headers = {};
    if (api_token) {
        headers["Authorization"] = `Bearer ${api_token}`;
    }

    try {
        const response = await axios.get(url, { headers });
        
        if (response.status === 200) {
            return res.json({ result: 1 });  // Return 1 if the model exists
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.json({ result: 0 });  // Return 0 if the model does not exist
        }
        return res.status(error.response ? error.response.status : 500).json({ error: "An error occurred" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
