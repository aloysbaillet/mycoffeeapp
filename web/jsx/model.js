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

  updateUserPaymentDataFromReceipts: function() {
    var usersRef = this.firebaseRef.child('userPaymentCache');
    this.firebaseRef.child('receiptList').child('current').orderByChild('timestamp').once('child_added', function(snapshot){
      var receipt = snapshot.val();
      var userRef = usersRef.child(receipt.payerId);
      userRef.child('credit').transaction(function(currentValue) {
        console.log('updateUserPaymentDataFromReceipts: transaction currentValue=', currentValue, ' receipts=', Object.keys(receipt.orderList).length);
        return (currentValue||0) + Object.keys(receipt.orderList).length;
      }, function(err, committed, ss) {
        if( err ) {
           console.log('Increment failed!', err);
        }
        else if( committed ) {
          userRef.update({lastPayment: receipt.timestamp});
        }
      });
    });

  },

  paySelectedOrders: function(payerId, payerDisplayName) {
    var _this = this;
    var orderListRef = this.firebaseRef.child('orderList').child('pendingSelection');
    orderListRef.orderByChild('selectedByUid')
      .equalTo(this.uid)
      .once('value', function(selectedSnapshot){
        var selected = selectedSnapshot.val();
        if(!selected)
          return;
        var data = {};
        var orderIdList = {};
        for(key in selected){
          data['/orderList/pending/' + key] = null;
          data['/orderList/pendingSelection/' + key] = null;
          data['/orderList/paid/' + key] = selected[key];
          orderIdList[key] = true;
        }
        var receiptId = _this.firebaseRef.child('receiptList').child('current').push().key();
        var receipt = {payerId: payerId,
                       payerName: payerDisplayName,
                       timestamp: Firebase.ServerValue.TIMESTAMP,
                       orderList: orderIdList
                       };
        data['/receiptList/current/' + receiptId] = receipt;
        console.log('paySelectedOrders: data=', data, 'json=', JSON.stringify(data));
        var firebaseRef = new Firebase(C.BASE_FIREBASE_URL);
        firebaseRef.update(data, function(error){
          if(error){
            console.log('Payment did not succeed!', error);
          }
          else{
            console.log('Payment complete!');
            _this.updateUserPaymentDataFromReceipts();
          }
        });
      });
  }
};

module.exports = Model;
