var React = require('react');
var Firebase = require('firebase');
require('firebase-util');
var ReactIntl = require('react-intl');

var PayButton = require('./paybutton.jsx');

var CandidateList = React.createClass({
  getInitialState: function() {
    return {
      pendingOrderCandidateMap: {},
      candidateCreditMap: {},
      candidateList: []
    };
  },

  componentWillMount: function() {
    var orderListRef = this.props.model.firebaseRef.child('orderList').child('pending');
    var userPaymentCacheRef = this.props.model.firebaseRef.child('userPaymentCache');
    var norm = new Firebase.util.NormalizedCollection([orderListRef, 'orders'],
                                                      [userPaymentCacheRef, 'credits', 'orders.uid']);
    norm = norm.select('orders.uid', 'orders.clientName', 'credits.credit', 'credits.lastPayment');
    this.normRef = norm.ref();
    this.normRef.on('value', this.onPendingOrderWithCredit);
  },

  componentWillUnmount: function() {
    this.normRef.off('value');
  },

  onPendingOrderWithCredit: function(snapshot) {
    var candidateMap = snapshot.val();
    console.log('candidateList:', candidateMap);
    var candidateList = [];
    for(i in candidateMap){
      var candidate = candidateMap[i];
      if(!(candidate.credit)) candidate.credit = 0;
      if(!(candidate.lastPayment)) candidate.lastPayment = 0;
      candidateList.push(candidate);
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
        <li key={index}>{item.clientName} ( credit: {item.credit}, {payment} ) <PayButton model={_this.props.model} payerId={item.uid}/></li>
      );
    };
    return (
      <ul>{ this.state.candidateList.map(createItem) }</ul>
    );
  }
});
module.exports = CandidateList;
