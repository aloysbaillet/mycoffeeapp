var Firebase = require('firebase');
var FirebaseTokenGenerator = require("firebase-token-generator");

var C = require('../jsx/constants.js');
var coffeeData = require("./coffeeData.json");

console.log("\n *START* \n");

var firebaseRef = new Firebase(C.BASE_FIREBASE_URL).child('coffeeData');

var tokenGenerator = new FirebaseTokenGenerator("Pib8TmJrrAFo9P9E0slMPgOzIXtSvHuOGEwRwG9Y");
var token = tokenGenerator.createToken({ "uid": "admin" }, {admin: true});

firebaseRef.authWithCustomToken(token, function(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Login Succeeded!", authData);
  }
});

firebaseRef.set(coffeeData, function(error) {
  if (error) {
    console.log("Data Upload Failed!", error);
  } else {
    console.log("Data Upload Success!");
  }
});

console.log("\n *EXIT* \n");
