var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');

var C = require('./constants.js');
var OrderRow = require('./orderrow.jsx');
var PayButton = require('./paybutton.jsx');

var PendingOrderList = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      numSelected: 0,
      pengingOrderList: []
    };
  },

  componentWillMount: function() {
    var orderListRef = this.props.model.firebaseRef.child('orderList').child('pending');
    var orderSelectionRef = this.props.model.firebaseRef.child('orderList').child('pendingSelection');
    this.orderListRef = new Firebase.util.NormalizedCollection(
      [orderListRef, 'orders'],
      [orderSelectionRef, 'selection'])
      .select('orders.coffeeType',
              'orders.sugar',
              'orders.milk',
              'orders.uid',
              'orders.timestamp',
              'orders.clientName',
              'selection.selected',
              'selection.selectedTimestamp',
              'selection.selectedByUid',
              'selection.selectedByUserDisplayName')
      .ref();
    this.bindAsArray(this.orderListRef, 'pengingOrderList');
  },

  handleSubmit: function(e) {
    e.preventDefault();
    this.props.model.paySelectedOrders();
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      var key = item['.key'];
      return (
        <OrderRow key={key} orderRef={_this.orderListRef.child(key)} model={_this.props.model}/>
      );
    };
    return (
      <form name="takeOrderForm" onSubmit={ this.handleSubmit }>
        <ul>{ this.state.pengingOrderList.map(createItem) }</ul>
        <PayButton model={this.props.model} payerId={this.props.model.uid} payerDisplayName={this.props.model.userDisplayName}/>
      </form>
    );
  }
});
module.exports = PendingOrderList;
