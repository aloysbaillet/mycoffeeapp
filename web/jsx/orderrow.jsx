var React = require('react');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');
var ReactFireMixin = require('reactfire');

module.exports = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      selectionList: {},
      order: {}
    };
  },

  componentWillMount: function() {
    this.orderRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeOrderList/items/' + this.props.orderKey);
    this.bindAsObject(this.orderRef, 'order');
    this.selectionListRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeSelectionList/items/');
    this.bindAsObject(this.selectionListRef, 'selectionList');
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

  onSelectionChange: function(e){
    var selectedBy = e.target.checked ? this.selectionListRef.getAuth().uid : null;
    var update = {};
    update[this.props.orderKey] = selectedBy;
    this.selectionListRef.update(update);
    console.log('sel', update);
  },

  onDelete: function(){
    this.orderRef.set(null);
  },

  render: function() {
    return (
      <li>
        <input type="checkbox" checked={ this.state.selectionList[this.props.orderKey] == this.orderRef.getAuth().uid } onChange={ this.onSelectionChange }/>
        { this.formatOrder(this.state.order) } ( { this.state.order.displayName } <ReactIntl.FormattedRelative value={this.state.order.timestamp} /> )
        <span onClick={ this.onDelete }
              style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
          X
        </span>
      </li>
    );
  }
});
