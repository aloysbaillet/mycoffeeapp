var Firebase = require('firebase');
var Fireproof = require('fireproof');
var FirebaseTokenGenerator = require("firebase-token-generator");

var C = require('../jsx/constants.js');
var coffeeData = require("./coffeeData.json");
var secret = require('./firebase-secret');
var logs = require('./coffeeTrainLogProcessed.json');

console.log("\n *START* \n");

var firebaseRef = new Firebase(C.BASE_FIREBASE_URL);
var fireproof = new Fireproof(firebaseRef);

var tokenGenerator = new FirebaseTokenGenerator(secret);
var token = tokenGenerator.createToken({ "uid": "admin" }, {admin: true});

fireproof.authWithCustomToken(token).then(function() {
  console.log('Successfully authenticated.')
}, function(err) {
  console.error('Error authenticating to Firebase!');
})

fireproof.child('userGroups').orderByChild('name').equalTo('Test').once('value').then(function(snapshot){
  var gid = Object.keys(snapshot.val())[0];
  console.log("Group: ", gid);
  var ref = fireproof.child('groupData').child(gid).child('receiptList').child('legacy');
  var legacyReceipts = {};
  for(var i in logs){
    var log = logs[i];
    legacyReceipts['legacy:'+log['_id']] = log;
    delete log['_id'];
  }
  ref.set(legacyReceipts);
  console.log('ALL PUSHED!');
});

console.log("\n *EXIT* \n");
