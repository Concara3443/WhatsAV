require('dotenv').config();
const axios = require('axios');

/**
 * Makes a GET request to the specified API.
 * 
 * @param {string} endpoint - The API endpoint.
 * @param {object} params - The request parameters.
 * @returns {Promise<object>} - The API response.
 * @throws {Error} - If an error occurs during the request.
 */
async function fetchData(endpoint, params) {
    const headers = {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    }

    try {
        const response = await axios.get(endpoint, { headers, params });
        console.log(response);
        return response.data;
    } catch (error) {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.error('Unauthorized access - perhaps check your API key?');
                    break;
                case 404:
                    console.error('The requested resource was not found.');
                    break;
                default:
                    console.error(`Error: ${error.response.status} - ${error.response.statusText}`);
            }
        } else if (error.request) {
            console.error('No response received from the server.');
        } else {
            console.error('Error setting up the request:', error.message);
        }
        throw new Error(`Failed to fetch data from ${endpoint}: ${error.message}`);
    }
}

module.exports = { fetchData };