var C = require('./constants.js')
var firebase = require('firebase');

var CoffeeModel = {
  init: function(firebaseRef, user, userDisplayName){
    this.firebaseRef = firebaseRef;
    this.groupId = null; // will be set by mycoffeeapp
    this.groupRef = null;
    console.log('Model.init displayName='+userDisplayName);
    if(user){
      this.uid = user.uid;
      this.userDisplayName = userDisplayName;
      this.firebaseRef.child('users').child(this.uid).update({displayName: userDisplayName});
    }
    else{
      this.uid = null;
      this.userDisplayName = '';
    }
  },

  setGroupId: function(groupId){
    this.groupId = groupId;
    if(groupId){
      this.firebaseRef
      .child('users')
      .child(this.uid)
      .update({groupId: groupId});
      this.groupRef = this.firebaseRef.child('groupData').child(this.groupId);
    }
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
      timestamp: firebase.database.ServerValue.TIMESTAMP,
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
      selectedTimestamp: firebase.database.ServerValue.TIMESTAMP,
      selectedByUid: this.uid,
      selectedByUserDisplayName: this.userDisplayName
    };
    console.log('selectOrder: data=', selData);
    var _this = this;
    this.groupRef
      .child('orderList')
      .child('pending')
      .child(orderId)
      .transaction(function(currentData) {
      for(var i in currentData){
        if(!(i in selData)) selData[i] = currentData[i];
      }
      if(currentData != null && currentData.selected && currentData.selectedByUid != _this.uid){
	    console.log('Order already selected by: ', currentData.selectedByUserDisplayName, currentData);
        return; // Abort the transaction.
      }
      console.log('selectedByUid=', currentData.selectedByUid, ' uid=', selData.selectedByUid);
      return selData;
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
      .push().key;
      var receipt = {payerId: payerId,
                     payerName: payerDisplayName,
                     timestamp: firebase.database.ServerValue.TIMESTAMP,
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

  updateUserPaymentCacheFromReceipt: function(receipt, data) {
    if(receipt.cancelled){
      console.log('updateUserPaymentCacheFromReceipts ignoring cancelled order ', receipt.timestamp);
      return;
    }
    console.log('receipt: ', receipt);
    var key = '/groupData/' + this.groupId + '/userPaymentCache/' + receipt.payerId;
    var cache = data[key] || {credit: 0, lastPayment: 0};
    cache.credit += receipt.cost;
    cache.lastPayment = Math.max(receipt.timestamp, cache.lastPayment);
    data[key] = cache;
    console.log('updateUserPaymentCacheFromReceipts payer uid=', receipt.payerId, ' cache=', cache);
    for(var orderId in receipt.orderList){
      var clientId = receipt.orderList[orderId];
      var clientKey = '/groupData/' + this.groupId + '/userPaymentCache/' + clientId;
      var clientCache = data[clientKey] || {credit: 0, lastPayment: 0};
      clientCache.credit -= 1;
      data[clientKey] = clientCache;
      console.log('updateUserPaymentCacheFromReceipts client uid=', clientId, ' cache=', clientCache);
    }
  },

  updateUserPaymentCacheFromReceipts: function() {
    this.groupRef
    .child('userPaymentCache')
    .once('value', function(snapshot){
      snapshot.forEach(function(childSnapshot) {
        childSnapshot.ref.remove();
      });
    });
    this.groupRef
    .child('receiptList')
    .orderByChild('timestamp')
    .once('value', function(snapshot){
      var data = {};
      var legacyReceipts = snapshot.child('legacy').val();
      for(var i in legacyReceipts){
        this.updateUserPaymentCacheFromReceipt(legacyReceipts[i], data);
      }
      var currentReceipts = snapshot.child('current').val();
      for(var i in currentReceipts){
        this.updateUserPaymentCacheFromReceipt(currentReceipts[i], data);
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
       timestamp: firebase.database.ServerValue.TIMESTAMP,
       text: message});
  },

  toggleOrderCancellation: function(receipt){
    var cancel = (receipt.cancelled != true);
    var data = {};
    var receiptId = receipt['.key'];
    var _this = this;
    data['/groupData/' + this.groupId + '/receiptList/current/' + receiptId + "/cancelled"] = cancel;
    if(cancel){
      console.log('Going to cancel receipt ' + receiptId + ": " + data);
    }
    else{
      console.log('Going to restore receipt ' + receiptId + ": " + data);
    }
    this.firebaseRef.update(data, function(error){
      if(error){
        console.log('Receipt not toggled!', error);
      }
      else{
        console.log('Receipt toggled!');
        _this.updateUserPaymentCacheFromReceipts();
      }
    });
  }

};

module.exports = CoffeeModel;
