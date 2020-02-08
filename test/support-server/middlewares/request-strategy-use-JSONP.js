/* eslint new-cap: 0 */
module.exports = requestStrategyUsesJSONP;

const express = require('express');

function requestStrategyUsesJSONP() {
  const router = express.Router();
  const calls = {};

  router.get('/reset', function(req, res) {
    calls[req.headers['user-agent']] = 0;
    res.send('ok');
  });

  router.get('/', function(req, res) {
    calls[req.headers['user-agent']]++;

    // only reply to the third JSONP request
    // 3 custom hosts, no dsn
    if (calls[req.headers['user-agent']] === 3) {
      res.jsonp({ hello: 'man' });
    } else {
      res.jsonp({ status: 500, message: 'woops!' });
    }
  });

  return router;
}
