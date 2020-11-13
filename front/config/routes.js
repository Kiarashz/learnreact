const express = require('express');
const path = require('path');

module.exports = function (app, config, passport) {

  app.get('/metadata', function (req, res) {
    res.set('Content-Type', 'text/xml')
    res.send(config.metadata)
  });

  app.get('/login',
    passport.authenticate(config.passport.strategy,
      {
        successRedirect: '/',
        failureRedirect: '/login'
      })
  );

  // callback from ADFS
  app.post(config.passport.saml.path,
    passport.authenticate(config.passport.strategy,
      {
        failureRedirect: '/',
        failureFlash: true
      }),
    function (req, res) {
      res.redirect('/');
    }
  );

  app.get('/logout', function (req, res) {
    req.logout();
    // TODO: invalidate session on IP
    res.redirect('/');
  });

};
