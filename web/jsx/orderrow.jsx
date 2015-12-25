var React = require('react');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');
var ReactFireMixin = require('reactfire');
var C = require('./constants.js');

module.exports = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      order: {}
    };
  },

  componentWillMount: function() {
    this.orderRef = this.props.model.firebaseRef.child('orderList').child('pending').child(this.props.orderKey);
    this.bindAsObject(this.orderRef, 'order');
  },

  formatOrder: function(order){
    var milk = "";
    if(order.milk)
      milk = order.milk + " ";
    var sug = "";
    if(order.sugar)
      sug = " with " + order.sugar;
    return milk + order.coffeeType + sug;
  },

  formatClient: function(order){
    ref.child('users').orderByChild
    return milk + order.coffeeType + sug;
  },

  onSelectionChange: function(e){
    var payerId = '';
    var payerName = '';
    if(e.target.checked){
      payerId = this.props.model.uid;
      payerName = this.props.model.userDisplayName;
    }
    var data = {};
    data['/orderList/pending/' + this.props.orderKey + '/payerId'] = payerId;
    data['/orderList/pending/' + this.props.orderKey + '/payerName'] = payerName;
    this.props.model.firebaseRef.update(data);
    console.log('selection:', data);
  },

  onDelete: function(){
    this.orderRef.set(null);
  },

  render: function() {
    return (
      <li>
        <input type="checkbox" checked={ this.state.order.payerId == this.props.model.uid } onChange={ this.onSelectionChange }/>
        { this.formatOrder(this.state.order) } ( { this.state.order.clientName } <ReactIntl.FormattedRelative value={this.state.order.timestamp} /> )
        <span onClick={ this.onDelete }
              style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
          X
        </span>
      </li>
    );
  }
});
