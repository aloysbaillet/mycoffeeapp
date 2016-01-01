require('firebase-util');
var C = require('./constants.js')

var Model = {
  init: function(firebaseRef){
    this.firebaseRef = firebaseRef;
    this.groupId = null; // will be set by mycoffeeapp
    this.groupRef = null;
    var auth = this.firebaseRef.getAuth();
    if(auth){
      this.uid = auth.uid;
      this.userDisplayName = auth.facebook.displayName;
      this.firebaseRef.child('users').child(this.uid).update({displayName: this.userDisplayName});
    }
    else{
      this.uid = null;
      this.userDisplayName = '';
    }
  },

  setGroupId: function(groupId){
    this.groupId = groupId;
    if(groupId)
      this.groupRef = this.firebaseRef.child('groupData').child(this.groupId);
    else
      this.groupRef = null;
  },

  formatOrder: function(order){
    var milk = "";
    if(order.milk)
      milk = order.milk + " ";
    var sug = "";
    if(order.sugar)
      sug = " with " + order.sugar;
    return milk + order.coffeeType + sug;
  },

  createOrder: function(coffeeType, sugar, milk, uid, clientName){
    var data = {
      coffeeType: coffeeType,
      sugar: sugar,
      milk: milk,
      uid: uid,
      timestamp: Firebase.ServerValue.TIMESTAMP,
      clientName: clientName,
      payerId: '',
      payerName: ''
    }
    console.log('createOrder: data=', JSON.stringify(data));
    this.groupRef
    .child('orderList')
    .child('pending')
    .push(data, function(error){
      if(error){
        console.log('Order creation did not succeed!', error);
      }
      else{
        console.log('Order creation complete!');
      }
    });
  },

  deleteOrder: function(orderId) {
    this.groupRef
    .child('orderList')
    .child('pending')
    .child(orderId)
    .remove();
  },

  selectOrder: function(orderId, selected) {
    var selData = {
      selected: selected,
      selectedTimestamp: Firebase.ServerValue.TIMESTAMP,
      selectedByUid: this.uid,
      selectedByUserDisplayName: this.userDisplayName
    };
    console.log('selectOrder: data=', selData);
    this.groupRef
      .child('orderList')
      .child('pending')
      .child(orderId)
      .transaction(function(currentData) {
      for(var i in currentData){
        if(!(i in selData)) selData[i] = currentData[i];
      }
      if (currentData === null || currentData.selectedByUid == undefined) {
        return selData;
      } else {
        console.log('selectedByUid=', currentData.selectedByUid, ' uid=', selData.selectedByUid)
        if(currentData.selectedByUid == selData.selectedByUid){
          return selData;
        }
        else{
          console.log('Order already selected by: ', currentData.selectedByUserDisplayName, currentData);
          return; // Abort the transaction.
        }
      }
    }, function(error, committed, snapshot) {
      if (error) {
        console.log('Transaction failed abnormally!', error);
      } else if (!committed) {
        console.log('We aborted the transaction.');
      } else {
        console.log('Order Selected!');
      }
      console.log('Order selection: ', snapshot.val());
    });
  },

  selectAllPendingOrders: function(selected) {
    this.groupRef
    .child('orderList')
    .child('pending')
    .once('value', function(snapshot){
      for(var key in snapshot.val())
        this.selectOrder(key, selected);
    }, this);
  },

  paySelectedOrders: function(payerId, payerDisplayName) {
    var _this = this;
    this.groupRef
    .child('orderList')
    .child('pending')
    .orderByChild('selectedByUid')
    .equalTo(this.uid)
    .once('value', function(selectedSnapshot){
      var selected = selectedSnapshot.val();
      var data = {};
      var orderIdList = {};
      var cost = 0;
      for(var key in selected){
        data['/groupData/' + this.groupId + '/orderList/pending/' + key] = null;
        data['/groupData/' + this.groupId + '/orderList/paid/' + key] = selected[key];
        orderIdList[key] = selected[key].uid;
        cost += 1;
      }
      var receiptId = this.groupRef
      .child('receiptList')
      .child('current')
      .push().key();
      var receipt = {payerId: payerId,
                     payerName: payerDisplayName,
                     timestamp: Firebase.ServerValue.TIMESTAMP,
                     orderList: orderIdList,
                     cost: cost
                     };
      data['/groupData/' + this.groupId + '/receiptList/current/' + receiptId] = receipt;
      this.firebaseRef.update(data, function(error){
        if(error){
          console.log('Payment did not succeed!', error);
        }
        else{
          console.log('Payment complete!');
          _this.updateUserPaymentCacheFromReceipts();
        }
      });
    }, this);
  },

  updateUserPaymentCacheFromReceipts: function() {
    this.groupRef
    .child('userPaymentCache')
    .once('value', function(snapshot){
      snapshot.forEach(function(childSnapshot) {
        childSnapshot.ref().remove();
      });
    });
    this.groupRef
    .child('receiptList')
    .child('current')
    .orderByChild('timestamp')
    .once('value', function(snapshot){
      var receipts = snapshot.val();
      var data = {};
      for(var i in receipts){
        var receipt = receipts[i];
        var key = '/groupData/' + this.groupId + '/userPaymentCache/' + receipt.payerId;
        var cache = data[key] || {credit: 0, lastPayment: 0};
        cache.credit += receipt.cost;
        cache.lastPayment = receipt.timestamp;
        data[key] = cache;
        console.log('updateUserPaymentCacheFromReceipts payer uid=', receipt.payerId, ' cache=', cache);
        for(var orderId in receipt.orderList){
          clientId = receipt.orderList[orderId];
          var clientKey = '/groupData/' + this.groupId + '/userPaymentCache/' + clientId;
          clientCache = data[clientKey] || {credit: 0, lastPayment: 0};
          clientCache.credit -= 1;
          data[clientKey] = clientCache;
          console.log('updateUserPaymentCacheFromReceipts client uid=', clientId, ' cache=', clientCache);
        }
      }
      console.log('updateUserPaymentCacheFromReceipts: data=', data);
      this.firebaseRef.update(data, function(error){
        if(error){
          console.log('updateUserPaymentCacheFromReceipts did not succeed!', error);
        }
        else{
          console.log('updateUserPaymentCacheFromReceipts complete!');
        }
      });
    }, this);
  },

  newChatMessage: function(message){
    this.groupRef
    .child('messages')
    .push({uid: this.uid,
       userDisplayName: this.userDisplayName,
       timestamp: Firebase.ServerValue.TIMESTAMP,
       text: message});
  }

};

module.exports = Model;
