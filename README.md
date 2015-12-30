# MyCoffeeApp #

To see in action: https://mycoffeeapp.firebaseapp.com

### A Coffee Run App ###

* To order coffees from friends and keep track of who paid when!
* 0.1.a1

### To develop: ###

* Install node.js
* Run this:
```
#!shell

cd web
npm install
firebase serve& # starts the firebase server locally
gulp& # watches for js changes and recompiles on the fly, notifies of errors as well!

```
* visit http://localhost:5000/

### To Deploy: ###
```npm run deploy```

### To change the schema: ###
* Edit the rules.yaml file (it's using the blaze format)
* To rebuild the rules.json and upload it: ```npm run rules```