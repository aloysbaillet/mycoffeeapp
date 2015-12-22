var React = require('react');
var Firebase = require('firebase');

var OrderRow = require('./orderrow.jsx');

module.exports = React.createClass({

  handleSubmit: function(e) {
    e.preventDefault();
    console.log("Pay!");
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <OrderRow order={item} key={index} />
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
