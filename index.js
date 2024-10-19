const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');

const app = express();
const PORT = 3000;

const CLIENT_ID = ''; //Tu cliente ID de Nitrado. / Your Client ID from Nitrado APP
const CLIENT_SECRET = ''; //Tu cliente Secret de Nitrado. /Your Client Secret from Nitrado APP
const REDIRECT_URI = 'http://localhost:3000/callback'; //Dejalo asi como esta. / Dont Touch
const AUTH_URL = 'https://oauth.nitrado.net/oauth/v2/auth'; //EndPoint API Nitrado OAuth
const TOKEN_URL = 'https://oauth.nitrado.net/oauth/v2/token'; //EndPoint API Nitrado Token

let state = crypto.randomBytes(16).toString('hex');

app.get('/', (req, res) => {
    res.send('<h1>Bienvenido a la autenticación con Nitrado</h1><a href="/login">Iniciar sesión con Nitrado</a>');
});

app.get('/login', (req, res) => {
    const url = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=service user_info&state=${state}`;
    res.redirect(url);
});

app.get('/callback', async(req, res) => {
    const {code, state: returnedState } = req.query;

    if (returnedState !== state) {
        return res.status(403).send('State mismatch. Possible CSRF Error');
    }

    try{
        const response = await axios.post(TOKEN_URL, querystring.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            code,
            grant_type: 'authorization_code',
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token, refresh_token } = response.data;
        res.send(`Access token: ${access_token}<br>Refresh token: ${refresh_token}`);

    } catch (error) {
        console.error('Error obtaining access token:', error.response?.data || error.message);
        res.status(500).send('Error obtaining access token.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor Ejecutandose en http://localhost:${PORT}`);
})
