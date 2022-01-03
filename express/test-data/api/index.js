var express = require('express');
var router = express.Router();

// get leaderBoard
router.get('/user/leaderBoard', function(req, res) {
  console.log('GET /user/leaderBoard' );
  var respBody = require('./leader-board.json');
  res.json(respBody);
});

// get user info
router.get('/user/:userId', function(req, res) {
  const userId = req.params.userId;
  console.log('GET /user/' + userId );
  var respBody = require('./user-info.json');
  res.json(respBody);
});

// get question list
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

// submit question answer
router.post('/binary', function(req, res) {
  // completeBinary();
  console.log('POST /binary');
  console.log(req.body);
	var respBody = require('./binary-answer.json');
  res.json(respBody);
});

// get mission list
var missionResp = require('./mission-list.json');
// setTimeout(function() {
//   console.log('mission game stop!');
//   missionResp = require('./mission-result.json');
// }, 120000);
router.get('/mission', function(req, res) {
  console.log('GET /mission');
  res.json(missionResp);
});

// submit mission answer
router.post('/mission/:missionType/:missionId', function(req, res) {
  const missionType = req.params.missionType;
  const missionId = req.params.missionId;
  console.log('POST /mission/' + missionType + '/' + missionId);
	var respBody;
  if (missionType === 'image') {
    console.log(req.body);
    respBody = require('./mission-answer-pending.json');
  } else {
    console.log(req.body);
    respBody = require('./mission-answer.json');
  }
  res.json(respBody);
});

// get current stack
router.get('/stack', function(req, res) {
  console.log('GET /stack' );
  var respBody = require('./current-stack.json');
  res.json(respBody);
});

// get stack history list
router.get('/stack/history', function(req, res) {
  console.log('GET /stack/history' );
  var respBody = require('./stack-history-list.json');
  res.json(respBody);
});

// submit stack
router.post('/stack/:stackId', function(req, res) {
  const stackId = req.params.stackId;
  console.log('POST /stack/' + stackId);
	var respBody;
  respBody = require('./stack-submit.json');
  res.json(respBody);
});

module.exports = router;
