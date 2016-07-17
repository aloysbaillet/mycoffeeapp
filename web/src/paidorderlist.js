var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var ReactIntl = require('react-intl');
var ReactBootstrap = require('react-bootstrap');

var PaidOrder = require('./paidorder.js');

var PaidOrderList = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      receiptList: [],
      expanded: false
    };
  },

  componentWillMount: function() {
    this.bindAsArray(this.props.model.groupRef.child('receiptList').child('current').orderByChild('timestamp').limitToLast(50), 'receiptList');
  },

  updateUserPaymentCacheFromReceipts: function() {
    this.props.model.updateUserPaymentCacheFromReceipts();
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <ReactBootstrap.ListGroupItem key={item['.key']}><PaidOrder model={_this.props.model} receipt={item} /></ReactBootstrap.ListGroupItem>
      );
    };
    var revOrderList = this.state.receiptList.slice();
    revOrderList.reverse();
    return (
      <div>
        <ReactBootstrap.ListGroup>{ revOrderList.map(createItem) }</ReactBootstrap.ListGroup>
        <ReactBootstrap.Button onClick={this.updateUserPaymentCacheFromReceipts}>Rebuild User Payment Cache</ReactBootstrap.Button>
      </div>
    );
  }
});
module.exports = PaidOrderList;
