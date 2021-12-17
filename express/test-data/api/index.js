var express = require('express');
var router = express.Router();

// get user info
router.get('/user/:userId', function(req, res) {
  const userId = req.params.userId;
  console.log('GET /user/' + userId );
  var respBody = require('./user-info.json');
  res.json(respBody);
});

// get question
var binaryResp = require('./binary-list.json');
function completeBinary() {
  binaryResp = require('./binary-waiting-result.json');
  stopBinary();
}
function stopBinary() {
  setTimeout(function() {
    console.log('binary game stop!');
    binaryResp = require('./binary-result.json');
  }, 30000);
}
router.get('/binary', function(req, res) {
  console.log('GET /binary');
  res.json(binaryResp);
});

// send question answer
router.post('/binary', function(req, res) {
  completeBinary();
  console.log('POST /binary');
  console.log(req.body);
	var respBody = require('./binary-answer.json');
  res.json(respBody);
});

// get mission
var missionResp = require('./mission-list.json');
setTimeout(function() {
  console.log('mission game stop!');
  missionResp = require('./mission-result.json');
}, 120000);
router.get('/mission', function(req, res) {
  console.log('GET /mission');
  res.json(missionResp);
});



module.exports = router;
