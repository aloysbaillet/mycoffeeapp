var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var ReactIntl = require('react-intl');

var PaidOrderList = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      paidList: []
    };
  },

  componentWillMount: function() {
    this.paidListRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeReceiptList/items/');
    this.bindAsArray(this.paidListRef.orderByChild('timestamp').limitToLast(20), 'paidList');
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <li key={index}>{item.orders.length} coffees paid by {item.displayName} on <ReactIntl.FormattedDate value={item.timestamp}/> at <ReactIntl.FormattedTime value={item.timestamp} hour="numeric" minute="numeric"/></li>
      );
    };
    return (
      <ul>{ this.state.paidList.map(createItem) }</ul>
    );
  }
});
module.exports = PaidOrderList;
