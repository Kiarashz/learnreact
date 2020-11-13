const proxy = require('http-proxy-middleware')
const fs = require('fs')
const express = require('express');
const https = require('https');
const path = require('path');
const passport = require('passport');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

require('dotenv').config()

const config = require('./config/config');
const httpsKey = fs.readFileSync(process.env.HTTPS_KEY)
const httpsCert = fs.readFileSync(process.env.HTTPS_CERT)

console.log('Using configuration', config);
require('./config/passport')(passport, config);

var app = express();

app.set('port', config.app.port);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');
app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session(
  {
    resave: true,
    saveUninitialized: true,
    secret: 'this shit hits'
  }));
app.use(passport.initialize());
app.use(passport.session());
require('./config/routes')(app, config, passport);

app.use(function(req, res, next) {
  console.log(`Request from: ${req.headers['x-forwarded-for']} ${req.connection.remoteAddress} 
    ${req.isAuthenticated() ? 'authenticated' : 'not authenticated'} 
    req.path=${req.path} ${req.path.match(/.login|.logout|.sso.*|.manifest.json/g) ? 'matches' : 'does not match'} public endpoint (/login,/login/callback,logout)
  `)
  if (req.isAuthenticated() || req.path.match(/.login.*|.logout|.sso.*|.manifest.json/g)) {
    console.log('calling next')
    next()
  }
  else {
    console.log('redirecting to login')
    res.redirect('/login')
  }
});

app.use('/api', proxy.createProxyMiddleware(
  {
    target: process.env.API_URL,
    changeOrigin: true,
    secure: false,
    ssl: {
      key: httpsKey,
      cert: httpsCert
    }
  }
))

app.use(express.static(path.join(__dirname, 'build')));

var options = {
  secureProtocol: 'TLSv1_2_server_method',
  secureOptions: https.SSL_OP_NO_TLSv1 | https.SSL_OP_NO_SSLv3 | https.SSL_OP_NO_TLSv1_1,
  cert: httpsCert,
  key: httpsKey,
  passphrase: process.env.PASSPHRASE,
  ciphers: [
      "ECDHE-RSA-AES256-SHA384",
      "DHE-RSA-AES256-SHA384",
      "ECDHE-RSA-AES256-SHA256",
      "DHE-RSA-AES256-SHA256",
      "ECDHE-RSA-AES128-SHA256",
      "DHE-RSA-AES128-SHA256",
      "HIGH",
      "!aNULL",
      "!eNULL",
      "!EXPORT",
      "!DES",
      "!RC4",
      "!MD5",
      "!PSK",
      "!SRP",
      "!CAMELLIA"
  ].join(':'),
  honorCipherOrder: true
};

const httpServer = https.createServer(options, app)
httpServer.listen(app.get('port'), 
  () => {
    console.log(`Express serving at https://${app.get('hostname')}:${app.get('port')}`)
  }
)
