var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var ReactIntl = require('react-intl');

var C = require('./constants.js');

var CandidateList = React.createClass({
  // mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      candidateNameMap: {},
      candidateCreditMap: {},
      candidateList: []
    };
  },

  componentWillMount: function() {
    var orderListRef = this.props.model.firebaseRef.child('orderList').child('pending');
    orderListRef.on('value', this.onPendingOrders);
    var userListRef = this.props.model.firebaseRef.child('userPaymentCache');
    userListRef.on('value', this.onPaymentCacheUpdated);
  },

  componentWillUnmount: function() {
    var orderListRef = this.props.model.firebaseRef.child('orderList').child('pending');
    orderListRef.off('value');
    var userListRef = this.props.model.firebaseRef.child('userPaymentCache');
    userListRef.off('value');
  },

  rebuildCandidateList: function() {
    var candidateList = [];
    var creditList = [];
    var done = {};
    for(uid in this.state.candidateCreditMap){
      creditList.push({uid: uid,
                       credit: this.state.candidateCreditMap[uid].credit,
                       lastPayment: this.state.candidateCreditMap[uid].lastPayment});
      done[uid] = true;
    }
    for(uid in this.state.candidateNameMap){
      if(!(uid in done)){
        creditList.push({uid: uid,
                         credit: 0,
                         lastPayment: 0});
      }
    }
    creditList.sort(function(a, b) {
      if(a.credit == b.credit){
        return a.lastPayment < b.lastPayment ? -1 : (a.lastPayment > b.lastPayment ? 1 : 0)
      }
      return a.credit < b.credit ? -1 : 1;
    });
    for(i in creditList){
      candidateList.push({credit: creditList[i].credit,
                          name:this.state.candidateNameMap[creditList[i].uid],
                          lastPayment: creditList[i].lastPayment});
    }
    this.setState({candidateList: candidateList});
  },

  onPendingOrders: function(snapshot) {
    var candidateNameMap = {};
    pendingOrderList = snapshot.val();
    for(key in pendingOrderList){
      var order = pendingOrderList[key];
      candidateNameMap[order.uid] = order.clientName;
    }
    this.setState({candidateNameMap: candidateNameMap});
    this.rebuildCandidateList();
  },

  onPaymentCacheUpdated: function(snapshot) {
    var candidateCreditMap = {};
    paymentCacheList = snapshot.val();
    for(uid in paymentCacheList){
      candidateCreditMap[uid] = {credit: paymentCacheList[uid].credit,
                                 lastPayment: paymentCacheList[uid].lastPayment};
    }
    this.setState({candidateCreditMap: candidateCreditMap});
    this.rebuildCandidateList();
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      var payment;
      if(item.lastPayment == 0)
        payment = <span>new member!</span>;
      else
        payment = <span>last payment: <ReactIntl.FormattedDate value={item.lastPayment}/></span>;
      return (
        <li key={index}>{item.name} ( credit: {item.credit}, {payment} )</li>
      );
    };
    return (
      <ul>{ this.state.candidateList.map(createItem) }</ul>
    );
  }
});
module.exports = CandidateList;
