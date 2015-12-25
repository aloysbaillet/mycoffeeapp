
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
        for(key in selected){
          data['/orderList/pending/' + key] = null;
          data['/orderList/paid/' + key] = selected[key];
        }
        var receiptId = _this.firebaseRef.child('receiptList').child('current').push().key();
        var receipt = {payerId: _this.uid,
                       payerName: _this.userDisplayName,
                       timestamp: Firebase.ServerValue.TIMESTAMP,
                       orderList: selected
                       };
        data['/receiptList/current/' + receiptId] = receipt;
        console.log('paySelectedOrders: data=', JSON.stringify(data));
        _this.firebaseRef.update(data, function(error){
          if(error){
            console.log('Payment did not succeed!', error);
          }
          else{
            console.log('Payment complete!');
          }
        });
      });
  }
};

module.exports = Model;
