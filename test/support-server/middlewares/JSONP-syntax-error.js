/* eslint new-cap: 0 */
module.exports = JSONPSyntaxError;

const express = require('express');

function JSONPSyntaxError() {
  const router = express.Router();
  const calls = {};

  router.get('/reset', function(req, res) {
    calls[req.headers['user-agent']] = 0;
    res.json({ calls: calls[req.headers['user-agent']] });
  });

  router.get('/calls', function(req, res) {
    res.json({ calls: calls[req.headers['user-agent']] });
  });

  router.get('/', function(req, res) {
    calls[req.headers['user-agent']]++;

    res.type('application/javascript');
    res.send('YAW! I THROW();');
  });

  return router;
}
