var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var ReactIntl = require('react-intl');

var C = require('./constants.js');

var PaidOrderList = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      receiptList: []
    };
  },

  componentWillMount: function() {
    this.bindAsArray(this.props.model.firebaseRef.child('receiptList').child('current').orderByChild('timestamp').limitToLast(20), 'receiptList');
  },

  render: function() {
    var createItem = function(item, index) {
      return (
        <li key={index}>{item.cost} <ReactIntl.FormattedPlural value={item.cost}
                    one="coffee"
                    other="coffees"
                /> paid by {item.payerName} on <ReactIntl.FormattedDate value={item.timestamp}/> at <ReactIntl.FormattedTime value={item.timestamp} hour="numeric" minute="numeric"/></li>
      );
    };
    var revOrderList = this.state.receiptList.slice();
    revOrderList.reverse();
    return (
      <ul>{ revOrderList.map(createItem) }</ul>
    );
  }
});
module.exports = PaidOrderList;
