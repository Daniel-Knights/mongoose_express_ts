import type { App, Req, Res, Next } from './typings/types';

require('dotenv').config();
require('./config/db');

import express = require('express');
import cors = require('cors');
import morgan = require('morgan');
import compression = require('compression');
import helmet = require('helmet');

const app: App = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: 'http://www.example.com' }));
app.use(morgan('dev'));
app.use(compression()); // Enable deflate/gzip
app.use(
    helmet({
        // Allow use in iframe
        frameguard: false,
    })
); // Protect HTTP headers

// Use this to create your JWT Secret then delete
const hexStr = require('crypto').randomBytes(64).toString('hex');
console.log('JWT Secret:', hexStr);

// Routes
app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/email', require('./routes/email'));

// app.use(function forceLiveDomain(req: Req, res: Res, next: Next) {
//     const host = req.get('Host');

//     if (host.includes('herokuapp')) {
//         return res.redirect(301, 'https://www.example.com' + req.originalUrl);
//     }

//     next();
// });

// Handle production
if (process.env.NODE_ENV === 'production') {
    // Static folder
    app.use(express.static(__dirname));

    // Handle SPA
    app.get(/.*/, (req: Req, res: Res) => res.sendFile(__dirname + '/index.html'));
}

// app.use(function forceSecureDomain(req: Req, res: Res, next: Next) {
//     res.redirect(301, 'https://www.example.com' + req.originalUrl);

//     next();
// });

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
