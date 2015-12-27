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
    this.bindAsArray(orderListRef.orderByChild('uid'), 'pengingOrderList');
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
    return (
      <form name="takeOrderForm" onSubmit={ this.handleSubmit }>
        <ul>{ this.state.pengingOrderList.map(createItem) }</ul>
        <PayButton model={this.props.model} />
      </form>
    );
  }
});
module.exports = PendingOrderList;
