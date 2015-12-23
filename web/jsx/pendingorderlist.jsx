var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');

var OrderRow = require('./orderrow.jsx');

var PendingOrderList = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      numSelected: 0,
      selectedOrders: [],
      items: []
    };
  },

  componentWillMount: function() {
    this.pendingListRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeOrderList/items/');
    this.bindAsArray(this.pendingListRef.orderByChild('paidBy').equalTo(null), 'items', this.cancelCallback);
    this.selectionListRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeSelectionList/items/');
    this.selectionListRef.orderByValue().equalTo(this.props.uid).on('value', this.onSelected);
  },

  onSelected: function(querySnapshot) {
    var numSelected = querySnapshot.numChildren();
    var selectedOrders = [];
    querySnapshot.forEach(function(orderSnapshot) {
      selectedOrders.push(orderSnapshot.key());
    });
    this.setState({numSelected: numSelected,
                   selectedOrders: selectedOrders});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeOrderList/items/');
    var uid = this.props.uid;
    var selectionListRef = this.selectionListRef;
    this.state.selectedOrders.forEach(function(key) {
      firebaseRef.child(key).update({'paidBy': uid});
      selectionListRef.child(key).set(null);
    });
    var receiptRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeReceiptList/items/');
    receiptRef.push({displayName: receiptRef.getAuth().facebook.displayName,
                     timestamp: Firebase.ServerValue.TIMESTAMP,
                     orders: this.state.selectedOrders,
                     uid: uid
                    });
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <OrderRow orderKey={item['.key']} key={index} />
      );
    };
    var PayButton;
    if(this.state.numSelected > 0)
      PayButton = <button>Pay for { this.state.numSelected } coffees!</button>;
    return (
      <form name="takeOrderForm" onSubmit={ this.handleSubmit }>
        <ul>{ this.state.items.map(createItem) }</ul>
        {PayButton}
      </form>
    );
  }
});
module.exports = PendingOrderList;
