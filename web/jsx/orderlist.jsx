var React = require('react');
var Firebase = require('firebase');

var OrderRow = require('./orderrow.jsx');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      numSelected: 0,
      selectedOrders: []
    };
  },

  componentWillMount: function() {
    var firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeOrderList/items/');
    firebaseRef.orderByChild('selectedBy')
               .equalTo(firebaseRef.getAuth().uid)
               .on('value', this.onSelectedByMe);
  },

  onSelectedByMe: function(querySnapshot) {
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
    this.state.selectedOrders.forEach(function(key) {
      firebaseRef.child(key).update({'paidBy': this.firebaseRef.getAuth().uid,
                                     'selectedBy': null})
    });
    var receiptRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeReceiptList/items/');
    receiptRef.push({displayName: firebaseRef.getAuth().facebook.displayName,
                     timestamp: Firebase.ServerValue.TIMESTAMP,
                     orders: this.state.selectedOrders,
                     uid: firebaseRef.getAuth().uid
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
        <ul>{ this.props.items.map(createItem) }</ul>
        {PayButton}
      </form>
    );
  }
});
