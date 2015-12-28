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
      pengingOrderList: {}
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
    this.setState({pengingOrderList: this.realOrderList});
  },

  // onSelectionRemoved: function(order, snapshot) {
  //   var sel = snapshot.val();
  //   order.selected = false;
  //   order.selectedTimestamp = 0;
  //   order.selectedByUserDisplayName = '';
  //   this.realOrderList[order.key] = order;
  //   this.setState({pengingOrderList: this.realOrderList});
  // },

  onPendingOrderAddedOrChanged: function(snapshot){
    var order = snapshot.val();
    order.key = snapshot.key();
    this.realOrderList[order.key] = order;
    this.setState({pengingOrderList: this.realOrderList});

    ref = this.props.model.firebaseRef
      .child('orderList')
      .child('pendingSelection')
      .orderByKey()
      .equalTo(snapshot.key());
    this.selRefs[snapshot.key()] = ref;
    ref.on('child_added', this.onSelectionAddedOrChanged.bind(null, order));
    ref.on('child_changed', this.onSelectionAddedOrChanged.bind(null, order));
    // ref.on('child_removed', this.onSelectionRemoved.bind(null, order));
  },

  onPendingOrderRemoved: function(snapshot) {
    delete this.realOrderList[snapshot.key()];
    this.setState({pengingOrderList: this.realOrderList});

    var order = snapshot.val();
    var ref = this.selRefs[snapshot.key()];
    ref.off('child_added', this.onSelectionAddedOrChanged.bind(null, order));
    ref.off('child_changed', this.onSelectionAddedOrChanged.bind(null, order));
    // ref.off('child_removed', this.onSelectionRemoved.bind(null, order));
  },

  handleSubmit: function(e) {
    e.preventDefault();
    this.props.model.paySelectedOrders();
  },

  getPendingOrderList: function() {
    var orderList = [];
    for(i in this.state.pengingOrderList){
      orderList.push(this.state.pengingOrderList[i]);
    }
    return orderList;
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <OrderRow key={item.key} order={item} model={_this.props.model} />
      );
    };
    return (
      <form name="takeOrderForm" onSubmit={ this.handleSubmit }>
        <ul>{ this.getPendingOrderList().map(createItem) }</ul>
        <PayButton model={this.props.model} payerId={this.props.model.uid} payerDisplayName={this.props.model.userDisplayName}/>
      </form>
    );
  }
});
module.exports = PendingOrderList;
