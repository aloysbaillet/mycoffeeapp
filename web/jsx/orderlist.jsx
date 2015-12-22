var React = require('react');
var Firebase = require('firebase');

var OrderRow = require('./orderrow.jsx');

module.exports = React.createClass({

  componentWillMount: function() {
    this.firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeOrderList/items/');
    this.firebaseRef.orderByChild('selectedBy')
                    .equalTo(this.firebaseRef.getAuth().uid)
                    .on('value', this.onSelectedByMe);
  },

  onSelectedByMe: function(querySnapshot) {
    var numSelected = querySnapshot.numChildren();
    this.setState({numSelected: numSelected});
  },

  getInitialState: function() {
    return {
      numSelected: 0
    };
  },

  handleSubmit: function(e) {
    e.preventDefault();
    console.log("Pay!");
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
