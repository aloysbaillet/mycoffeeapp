var React = require('react');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');

module.exports = React.createClass({

  handleSubmit: function(e) {
    e.preventDefault();
    console.log("Pay!");
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      var milk = "";
      if(item.milk)
        milk = item.milk + " ";
      var sug = "";
      if(item.sugar)
        sug = " with " + item.sugar;
      return (
        <li key={ index }>
          <input type="checkbox" value="false"/>
          { milk + item.coffeeType + sug } ( { item.displayName } <ReactIntl.FormattedRelative value={item.timestamp} /> )
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
