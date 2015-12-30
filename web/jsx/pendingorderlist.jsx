var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');

var C = require('./constants.js');
var OrderRow = require('./orderrow.jsx');
var PayButton = require('./paybutton.jsx');
var Checkbox = require('./check.jsx');

var PendingOrderList = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      pendingOrderList: {}
    };
  },

  componentWillMount: function() {
    this.bindAsArray(this.props.model.firebaseRef
      .child('orderList')
      .child('pending')
      .orderByChild('timestamp')
      , 'pendingOrderList');
  },

  handleSubmit: function(e) {
    e.preventDefault();
    this.props.model.paySelectedOrders();
  },

  onSelectAll: function(value, e) {
    this.props.model.selectAllPendingOrders(value);
  },

  onNextValue: function(oldValue, props){
    if(oldValue == null){
      return true;
    }
    return !oldValue;
  },

  getNumSelected: function() {
    var numSelected = 0;
    for(var i in this.state.pendingOrderList){
      var order = this.state.pendingOrderList[i];
      if(order.selected && order.selectedByUid == this.props.model.uid)
        numSelected += 1;
    }
    return numSelected;
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <OrderRow key={item['.key']} order={item} model={_this.props.model} />
      );
    };
    var numSelected = this.getNumSelected();
    var sel = null;
    if(numSelected == 0)
      sel = false;
    else if (numSelected == this.state.pendingOrderList.length)
      sel = true;
    var selAll;
    if(this.state.pendingOrderList.length>0)
      selAll = <Checkbox checked={sel} onChange={this.onSelectAll} nextValue={this.onNextValue}>Select All</Checkbox>;
    var reversed = this.state.pendingOrderList.slice();
    reversed.reverse();
    return (
      <form name="takeOrderForm" onSubmit={ this.handleSubmit }>
        {selAll} <PayButton model={this.props.model} payerId={this.props.model.uid} payerDisplayName={this.props.model.userDisplayName}/>
        <ul>{ reversed.map(createItem) }</ul>
      </form>
    );
  }
});
module.exports = PendingOrderList;
