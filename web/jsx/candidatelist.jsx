var React = require('react');
var Firebase = require('firebase');
var FirebaseUtil = require('firebase-util');
var ReactIntl = require('react-intl');
var _ = require('underscore');

var PayButton = require('./paybutton.jsx');

var CandidateList = React.createClass({
  getInitialState: function() {
    return {
      candidateMap: {},
      candidateList: []
    };
  },

  componentWillMount: function() {
    var orderListRef = this.props.model.firebaseRef.child('orderList').child('pending');
    var userPaymentCacheRef = this.props.model.firebaseRef.child('userPaymentCache');
    var _this = this;
    orderListRef.on('child_added', function(snapshot){
      var order = snapshot.val();
      var newMap = _.extend({}, _this.state.candidateMap);
      newMap[order.uid] = order;
      _this.setState({candidateMap: newMap});
      _this.rebuildCandidateList(newMap);
      console.log('onPendingOrder: order=', order);
      userPaymentCacheRef
        .orderByKey()
        .equalTo(order.uid)
        .on('child_added', function(snapshot) {
          var credit = snapshot.val();
          order.credit = credit.credit;
          order.lastPayment = credit.lastPayment;
          var newMap = _.extend({}, _this.state.candidateMap);
          newMap[order.uid] = order;
          _this.setState({candidateMap: newMap});
          console.log('onPaymentCache: order=', order, 'credit=', credit);
          _this.rebuildCandidateList(newMap);
      });
    });
    // var userPaymentCacheRef = this.props.model.firebaseRef.child('userPaymentCache');
    // var norm = new FirebaseUtil.NormalizedCollection([orderListRef, 'orders'],
    //                                                   [userPaymentCacheRef, 'credits', 'orders.uid']);
    // norm = norm.select('orders.uid', 'orders.clientName', 'credits.credit', 'credits.lastPayment');
    // this.normRef = norm.ref();
    // this.normRef.on('value', this.onPendingOrderWithCredit);
  },

  componentWillUnmount: function() {
    // this.normRef.off('value');
  },

  rebuildCandidateList: function(candidateMap) {
    console.log('candidateMap:', candidateMap);
    var candidateList = [];
    var done = {};
    for(i in candidateMap){
      var candidate = candidateMap[i];
      if(!(candidate.credit)) candidate.credit = 0;
      if(!(candidate.lastPayment)) candidate.lastPayment = 0;
      if(!(candidate.uid in done)){
        candidateList.push(candidate);
        done[candidate.uid] = true;
      }
    }
    candidateList.sort(function(a, b) {
      if(a.credit == b.credit){
        return a.lastPayment < b.lastPayment ? -1 : (a.lastPayment > b.lastPayment ? 1 : 0)
      }
      return a.credit < b.credit ? -1 : 1;
    });
    console.log('rebuildCandidateList: sorted candidateList=', candidateList)
    this.setState({candidateList: candidateList});
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
        <li key={index}>{item.clientName} ( credit: {item.credit}, {payment} ) <PayButton model={_this.props.model} payerId={item.uid} payerDisplayName={item.clientName}/></li>
      );
    };
    return (
      <ul>{ this.state.candidateList.map(createItem) }</ul>
    );
  }
});
module.exports = CandidateList;
