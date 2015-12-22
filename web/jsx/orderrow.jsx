var React = require('react');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');
var ReactFireMixin = require('reactfire');

module.exports = React.createClass({
  mixins: [ReactFireMixin],

  componentWillMount: function() {
    this.firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeOrderList/items/' + this.props.orderKey);
    this.bindAsObject(this.firebaseRef, 'order');
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
    var selectedBy = e.target.checked ? this.firebaseRef.getAuth().uid : null;
    this.firebaseRef.update({selectedBy: selectedBy});
  },

  onDelete: function(){
    this.firebaseRef.set(null);
  },

  render: function() {
    return (
      <li>
        <input type="checkbox" checked={ this.state.order.selectedBy == this.firebaseRef.getAuth().uid } onChange={ this.onSelectionChange }/>
        { this.formatOrder(this.state.order) } ( { this.state.order.displayName } <ReactIntl.FormattedRelative value={this.state.order.timestamp} /> )
        <span onClick={ this.onDelete }
              style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
          X
        </span>
      </li>
    );
  }
});
