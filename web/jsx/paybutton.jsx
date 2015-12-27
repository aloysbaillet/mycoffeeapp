var React = require('react');
var Firebase = require('firebase');

var C = require('./constants.js');

var PayButton = React.createClass({
  getInitialState: function() {
    return {
      numSelected: 0,
    };
  },

  componentWillMount: function() {
    var orderListRef = this.props.model.firebaseRef.child('orderList').child('pending');
    orderListRef.orderByChild('payerId').equalTo(this.props.model.uid).on('value', this.onSelected);
  },

  onSelected: function(querySnapshot) {
    var numSelected = querySnapshot.numChildren();
    this.setState({numSelected: numSelected});
  },

  onClick: function() {
    this.props.model.paySelectedOrders();
  },

  render: function() {
    if(this.state.numSelected)
      return (
        <a href="#" onClick={this.onClick}>Pay for { this.state.numSelected } coffees</a>
      );
    else
      return (
        <span>Select an order to pay</span>
      );
  }
});
module.exports = PayButton;
