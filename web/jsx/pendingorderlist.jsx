var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var C = require('./constants.js');
var OrderRow = require('./orderrow.jsx');

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
    this.bindAsArray(orderListRef.orderByChild('uid'), 'pengingOrderList');
    orderListRef.orderByChild('payerId').equalTo(this.props.model.uid).on('value', this.onSelected);
  },

  onSelected: function(querySnapshot) {
    var numSelected = querySnapshot.numChildren();
    this.setState({numSelected: numSelected});
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
        <OrderRow orderKey={key} key={key} model={_this.props.model}/>
      );
    };
    var PayButton;
    if(this.state.numSelected > 0)
      PayButton = <button>Pay for { this.state.numSelected } coffees!</button>;
    return (
      <form name="takeOrderForm" onSubmit={ this.handleSubmit }>
        <ul>{ this.state.pengingOrderList.map(createItem) }</ul>
        {PayButton}
      </form>
    );
  }
});
module.exports = PendingOrderList;
