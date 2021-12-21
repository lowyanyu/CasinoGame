const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const e = require('express');

router.use(bodyParser.urlencoded({
  extended: false
}));
router.use(bodyParser.json({limit: '2100000kb'}));

router.use(cors());

router.all('/', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// login
router.post('/api/user/login', function(req, res) {
	console.log('POST /login');
	const account = req.body.account;
	const pwd = req.body.pwd;
	console.log('User[' + account + '] login!');
	var respBody = require('../test-data/login.json');
  res.json(respBody);
});

// ----------------------------------------------------- APIs
var api = require('../test-data/api/index');
router.use('/api', api);

module.exports = router;
