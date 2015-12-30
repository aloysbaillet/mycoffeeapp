var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var FirebaseUtil = require('firebase-util');
var ReactIntl = require('react-intl');
var _ = require('underscore');

var UserList = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      orderList: [],
    };
  },

  onExpand: function() {
    var ol = []
    for(var orderId in this.props.receipt.orderList){
      this.props.model.firebaseRef
      .child('orderList')
      .child('paid')
      .child(orderId)
      .once('value', function(snapshot){
        var order = snapshot.val();
        ol.push(order);
        this.setState({orderList: ol})
      }, this);
    }
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <li key={index} >{item.clientName} ( {_this.props.model.formatOrder(item)} )</li>
      );
    };
    var orders;
    if(this.state.orderList.length > 0){
      orders = <ul>{this.state.orderList.map(createItem)}</ul>
    }
    else{
      orders = <a href="#" onClick={this.onExpand}>Expand Orders</a>
    }
    return (
      <span>{this.props.receipt.cost}&nbsp;
        <ReactIntl.FormattedPlural value={this.props.receipt.cost}
          one="coffee"
          other="coffees"
        />&nbsp;
        paid by {this.props.receipt.payerName} on&nbsp;
        <ReactIntl.FormattedDate value={this.props.receipt.timestamp}/>&nbsp;
        at <ReactIntl.FormattedTime value={this.props.receipt.timestamp} hour="numeric" minute="numeric"/>&nbsp;
        {orders}
      </span>
    );
  }
});
module.exports = UserList;
