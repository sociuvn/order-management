import express from 'express';
import compression from 'compression';  // compresses requests
import bodyParser from 'body-parser';

// Controllers (route handlers)
import * as apiController from './controllers/api';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);

export default app;
