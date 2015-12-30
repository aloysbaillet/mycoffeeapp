var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var ReactIntl = require('react-intl');

var PaidOrder = require('./paidorder.jsx');

var PaidOrderList = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      receiptList: []
    };
  },

  componentWillMount: function() {
    this.bindAsArray(this.props.model.firebaseRef.child('receiptList').child('current').orderByChild('timestamp').limitToLast(50), 'receiptList');
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <li key={item['.key']}><PaidOrder model={_this.props.model} receipt={item} /></li>
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
