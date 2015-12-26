
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

  selectOrder: function(orderId, payerId, payerName) {
    var data = {};
    data['/orderList/pending/' + orderId + '/payerId'] = payerId;
    data['/orderList/pending/' + orderId + '/payerName'] = payerName;
    this.firebaseRef.update(data);
    console.log('selectOrder: data=', data);
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
    /*
      var credit = 0;
      var lastPayment = 0;
      if(receipt.payerId in userData){
        credit = userData[receipt.payerId].credit;
        lastPayment = userData[receipt.payerId].lastPayment;
      }
      credit = credit + receipt.orderList.length;
      lastPayment = Math.max(lastPayment, receipt.timestamp);
      userData[receipt.payerId] = {credit: credit,
                                   lastPayment: lastPayment};
      */
    });

  },

  paySelectedOrders: function() {
    var _this = this;
    this.firebaseRef
      .child('orderList')
      .child('pending')
      .orderByChild('payerId')
      .equalTo(this.uid)
      .once('value', function(selectedSnapshot){
        var selected = selectedSnapshot.val();
        if(!selected)
          return;
        var data = {};
        var orderIdList = {};
        for(key in selected){
          data['/orderList/pending/' + key] = null;
          data['/orderList/paid/' + key] = selected[key];
          orderIdList[key] = true;
        }
        var receiptId = _this.firebaseRef.child('receiptList').child('current').push().key();
        var receipt = {payerId: _this.uid,
                       payerName: _this.userDisplayName,
                       timestamp: Firebase.ServerValue.TIMESTAMP,
                       orderList: orderIdList
                       };
        data['/receiptList/current/' + receiptId] = receipt;
        console.log('paySelectedOrders: data=', data, 'json=', JSON.stringify(data));
        _this.firebaseRef.update(data, function(error){
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
