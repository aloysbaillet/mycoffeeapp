var React = require('react');
var ReactIntl = require('react-intl');
var ReactBootstrap = require('react-bootstrap');

var PayButton = require('./paybutton.js');

var CandidateList = React.createClass({
  getInitialState: function() {
    return {
      candidateMap: {}
    };
  },

  componentWillMount: function() {
    this.realCandidateList = {};
    this.orderListRef = this.props.model.groupRef.child('orderList').child('pending');
    this.orderListRef.on('child_added', this.onPendingOrderAddedOrChanged);
    this.orderListRef.on('child_changed', this.onPendingOrderAddedOrChanged);
    this.orderListRef.on('child_removed', this.onPendingOrderRemoved);
  },

  componentWillUnmount: function() {
    this.orderListRef.off('child_added', this.onPendingOrderAddedOrChanged);
    this.orderListRef.off('child_changed', this.onPendingOrderAddedOrChanged);
    this.orderListRef.off('child_removed', this.onPendingOrderRemoved);
  },

  onPaymentCacheAddedOrChanged: function(order, snapshot) {
    var credit = snapshot.val();
    if(!credit)
      return;
    order.credit = credit.credit;
    order.lastPayment = credit.lastPayment;
    this.realCandidateList[order.uid] = order;
    this.setState({candidateMap: this.realCandidateList});
  },

  onPendingOrderAddedOrChanged: function(snapshot){
    var order = snapshot.val();
    this.realCandidateList[order.uid] = order;
    this.setState({candidateMap: this.realCandidateList});
    this.props.model.groupRef
      .child('userPaymentCache')
      .child(order.uid)
      .once('value', this.onPaymentCacheAddedOrChanged.bind(null, order));
  },

  onPendingOrderRemoved: function(snapshot) {
    var order = snapshot.val();
    delete this.realCandidateList[order.uid];
    this.setState({candidateMap: this.realCandidateList});
  },

  getCandidateList: function() {
    var candidateList = [];
    var done = {};
    for(var i in this.state.candidateMap){
      var candidate = this.state.candidateMap[i];
      if(!(candidate.credit)) candidate.credit = 0;
      if(!(candidate.lastPayment)) candidate.lastPayment = 0;
      if(!(candidate.uid in done)){
        candidateList.push(candidate);
        done[candidate.uid] = true;
      }
    }
    candidateList.sort(function(a, b) {
      if(a.credit === b.credit){
        return a.lastPayment < b.lastPayment ? -1 : (a.lastPayment > b.lastPayment ? 1 : 0);
      }
      return a.credit < b.credit ? -1 : 1;
    });
    return candidateList;
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      var payment;
      if(item.lastPayment === 0)
        payment = <span>never paid!</span>;
      else
        payment = <span>last payment: <ReactIntl.FormattedDate value={item.lastPayment}/></span>;
      return (
        <ReactBootstrap.ListGroupItem key={index}>
          {item.clientName} ( credit: {item.credit}, {payment} ) <PayButton model={_this.props.model} payerId={item.uid} payerDisplayName={item.clientName}/>
        </ReactBootstrap.ListGroupItem>
      );
    };
    return (
      <ReactBootstrap.ListGroup>{ this.getCandidateList().map(createItem) }</ReactBootstrap.ListGroup>
    );
  }
});
module.exports = CandidateList;