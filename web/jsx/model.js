require('firebase-util');
var C = require('./constants.js')

var Model = {
  init: function(firebaseRef){
    this.firebaseRef = firebaseRef;
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
    this.firebaseRef.child('orderList').child('pending').push(data, function(error){
      if(error){
        console.log('Order creation did not succeed!', error);
      }
      else{
        console.log('Order creation complete!');
      }
    });
  },

  deleteOrder: function(orderId) {
    this.firebaseRef.child('orderList').child('pending').child(orderId).remove();
    this.firebaseRef.child('orderList').child('pendingSelection').child(orderId).remove();
  },

  selectOrder: function(orderId, selected) {
    var selData = {
      selected: selected,
      selectedTimestamp: Firebase.ServerValue.TIMESTAMP,
      selectedByUid: this.uid,
      selectedByUserDisplayName: this.userDisplayName
    };
    console.log('selectOrder: data=', selData);
    this.firebaseRef
      .child('orderList')
      .child('pendingSelection')
      .child(orderId)
      .transaction(function(currentData) {
      if (currentData === null) {
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
    this.firebaseRef.child('orderList').child('pending').once('value', function(snapshot){
      for(var key in snapshot.val())
        this.selectOrder(key, selected);
    }, this);
  },

  updateUserPaymentCacheFromReceipts: function() {
    this.firebaseRef
    .child('userPaymentCache')
    .once('value', function(snapshot){
      snapshot.forEach(function(childSnapshot) {
        childSnapshot.ref().remove();
      });
    });
    this.firebaseRef
    .child('receiptList')
    .child('current')
    .orderByChild('timestamp')
    .once('value', function(snapshot){
      var receipts = snapshot.val();
      var data = {};
      for(var i in receipts){
        var receipt = receipts[i];
        var key = '/userPaymentCache/' + receipt.payerId;
        var cache = data[key];
        if(!cache)
          cache = {credit: 0,
                   lastPayment: 0};
        cache.credit += receipt.cost;
        cache.lastPayment = receipt.timestamp;
        data[key] = cache;
      }
      this.firebaseRef.update(data);
    }, this);
  },

  paySelectedOrders: function(payerId, payerDisplayName) {
    var _this = this;
    this.firebaseRef
    .child('orderList')
    .child('pendingSelection')
    .orderByChild('selectedByUid')
    .equalTo(this.uid)
    .once('value', function(selectedSnapshot){
      var selected = selectedSnapshot.val();
      if(!selected)
        return;
      var data = {};
      var orderIdList = {};
      var cost = 0;
      for(var key in selected){
        data['/orderList/pending/' + key] = null;
        data['/orderList/pendingSelection/' + key] = null;
        data['/orderList/paid/' + key] = selected[key];
        orderIdList[key] = true;
        cost += 1;
      }
      var receiptId = _this.firebaseRef.child('receiptList').child('current').push().key();
      var receipt = {payerId: payerId,
                     payerName: payerDisplayName,
                     timestamp: Firebase.ServerValue.TIMESTAMP,
                     orderList: orderIdList,
                     cost: cost
                     };
      data['/receiptList/current/' + receiptId] = receipt;
      _this.firebaseRef
      .child('userPaymentCache')
      .child(payerId)
      .once('value', function(snapshot){
        data['/userPaymentCache/' + payerId + '/credit'] = snapshot.val().credit + cost;
        console.log('paySelectedOrders: data=', data);
        _this.firebaseRef.update(data, function(error){
          if(error){
            console.log('Payment did not succeed!', error);
          }
          else{
            console.log('Payment complete!');
          }
        });
      });
    });
  }
};

module.exports = Model;
