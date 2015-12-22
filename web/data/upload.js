var Firebase = require('firebase');
console.log("\n *START* \n");
var coffeeData = require("./coffeeData.json");
console.log("Output Content : \n"+ coffeeData);
var firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeData');

var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator("Pib8TmJrrAFo9P9E0slMPgOzIXtSvHuOGEwRwG9Y");
var token = tokenGenerator.createToken({ "uid": "1" }, {admin: true});

firebaseRef.authWithCustomToken(token, function(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Login Succeeded!", authData);
  }
});

firebaseRef.set(coffeeData);
console.log("\n *EXIT* \n");
