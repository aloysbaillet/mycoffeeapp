import React from 'react';
var createReactClass = require('create-react-class');
import ReactFireMixin from 'reactfire';
import Firebase from 'firebase';
import ReactIntl from 'react-intl';
import moment from 'moment';
import {ListGroup, Checkbox} from 'react-bootstrap';

import OrderRow from './orderrow.js';
import PayButton from './paybutton.js';


var PendingOrderList = createReactClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      pendingOrderList: [],
      paymentCache: {}
    };
  },

  componentWillMount: function() {
    this.bindAsArray(this.props.model.groupRef
      .child('orderList')
      .child('pending')
      , 'pendingOrderList');
    this.bindAsObject(this.props.model.groupRef
        .child('userPaymentCache')
        , 'paymentCache');
  },

  getOrderList: function() {
    var orderList = [];
    var done = {};
    for(var i in this.state.pendingOrderList){
      var order = this.state.pendingOrderList[i];
      var cache = this.state.paymentCache[order.uid] || {credit: 0, lastPayment: 0};
      order.credit = cache.credit;
      order.lastPayment = cache.lastPayment;
      orderList.push(order);
    }
    orderList.sort(function(a, b) {
      if(a.credit === b.credit){
        return a.lastPayment < b.lastPayment ? -1 : (a.lastPayment > b.lastPayment ? 1 : 0);
      }
      return a.credit < b.credit ? -1 : 1;
    });
    return orderList;
  },

  handleSubmit: function(e) {
    e.preventDefault();
    this.props.model.paySelectedOrders();
  },

  onSelectAll: function(e) {
    this.props.model.selectAllPendingOrders(e.target.checked);
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
    var sel = false;
    var orderList = this.getOrderList();
    if(numSelected == 0)
      sel = false;
    else if (numSelected == orderList.length)
      sel = true;
    var selAll;
    if(orderList.length>0)
      selAll = <Checkbox checked={sel} onChange={this.onSelectAll}>Select All</Checkbox>;
    return (
      <form name="takeOrderForm" onSubmit={ this.handleSubmit }>
        {selAll} <PayButton model={this.props.model} payerId={this.props.model.uid} payerDisplayName={this.props.model.userDisplayName}/>
        <ListGroup>{ orderList.map(createItem) }</ListGroup>
      </form>
    );
  }
});
module.exports = PendingOrderList;
