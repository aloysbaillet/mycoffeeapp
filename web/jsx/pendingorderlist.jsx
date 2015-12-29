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
    this.realOrderList = {};
    this.selRefs = {};
    this.orderListRef = this.props.model.firebaseRef.child('orderList').child('pending');
    this.orderListRef.on('child_added', this.onPendingOrderAddedOrChanged);
    this.orderListRef.on('child_changed', this.onPendingOrderAddedOrChanged);
    this.orderListRef.on('child_removed', this.onPendingOrderRemoved);
  },

  componentWillUnmount: function() {
    this.orderListRef.off('child_added', this.onPendingOrderAddedOrChanged);
    this.orderListRef.off('child_changed', this.onPendingOrderAddedOrChanged);
    this.orderListRef.off('child_removed', this.onPendingOrderRemoved);
  },

  onSelectionAddedOrChanged: function(order, snapshot) {
    var sel = snapshot.val();
    order.selected = sel.selected;
    order.selectedTimestamp = sel.selectedTimestamp;
    order.selectedByUserDisplayName = sel.selectedByUserDisplayName;
    order.selectedByUid = sel.selectedByUid;
    this.realOrderList[order.key] = order;
    this.setState({pendingOrderList: this.realOrderList});
  },

  onPendingOrderAddedOrChanged: function(snapshot){
    var order = snapshot.val();
    order.key = snapshot.key();
    this.realOrderList[order.key] = order;
    this.setState({pendingOrderList: this.realOrderList});

    ref = this.props.model.firebaseRef
      .child('orderList')
      .child('pendingSelection')
      .orderByKey()
      .equalTo(snapshot.key());
    this.selRefs[snapshot.key()] = ref;
    ref.on('child_added', this.onSelectionAddedOrChanged.bind(null, order));
    ref.on('child_changed', this.onSelectionAddedOrChanged.bind(null, order));
  },

  onPendingOrderRemoved: function(snapshot) {
    delete this.realOrderList[snapshot.key()];
    this.setState({pendingOrderList: this.realOrderList});

    var order = snapshot.val();
    var ref = this.selRefs[snapshot.key()];
    ref.off('child_added', this.onSelectionAddedOrChanged.bind(null, order));
    ref.off('child_changed', this.onSelectionAddedOrChanged.bind(null, order));
  },

  handleSubmit: function(e) {
    e.preventDefault();
    this.props.model.paySelectedOrders();
  },

  getPendingOrderList: function() {
    var orderList = [];
    var numSelected = 0;
    for(var i in this.state.pendingOrderList){
      order = this.state.pendingOrderList[i];
      orderList.push(order);
      if(order.selected && order.selectedByUid == this.props.model.uid)
        numSelected += 1;
    }
    return {
      orderList: orderList,
      numSelected: numSelected
    };
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

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <OrderRow key={item.key} order={item} model={_this.props.model} />
      );
    };
    var o = this.getPendingOrderList();
    var sel = null;
    if(o.numSelected == 0)
      sel = false;
    else if (o.numSelected == o.orderList.length)
      sel = true;
    var selAll;
    if(o.orderList.length>0)
      selAll = <Checkbox checked={sel} onChange={this.onSelectAll} nextValue={this.onNextValue}>Select All</Checkbox>;
    return (
      <form name="takeOrderForm" onSubmit={ this.handleSubmit }>
        {selAll} <PayButton model={this.props.model} payerId={this.props.model.uid} payerDisplayName={this.props.model.userDisplayName}/>
        <ul>{ o.orderList.map(createItem) }</ul>
      </form>
    );
  }
});
module.exports = PendingOrderList;
