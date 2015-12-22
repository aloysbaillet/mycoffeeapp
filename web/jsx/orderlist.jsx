var React = require('react');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');

module.exports = React.createClass({

  handleSubmit: function(e) {
    e.preventDefault();
    console.log("Pay!");
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

  onSelectionChange: function(key, e){
    this.props.selectItem(key, e.target.value);
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <li key={ index }>
          <input type="checkbox" value={item.selectedBy == _this.props.uid} onChange={ _this.onSelectionChange.bind(null, item['.key']) }/>
          { _this.formatOrder(item) } ( { item.displayName } <ReactIntl.FormattedRelative value={item.timestamp} /> )
          <span onClick={ _this.props.removeItem.bind(null, item['.key']) }
                style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
            X
          </span>
        </li>
      );
    };
    return (
      <form name="takeOrderForm" onSubmit={ this.handleSubmit }>
        <ul>{ this.props.items.map(createItem) }</ul>
        <button>Pay</button>
      </form>
    );
  }
});
