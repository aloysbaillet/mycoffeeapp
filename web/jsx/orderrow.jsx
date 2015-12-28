var React = require('react');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');
var ReactFireMixin = require('reactfire');
var C = require('./constants.js');

var OrderRow = React.createClass({
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

  onSelectClick: function(e){
    this.props.model.selectOrder(this.props.order.key, true);
  },

  onDeselectClick: function(e){
    this.props.model.selectOrder(this.props.order.key, false);
  },

  onDelete: function(){
    this.props.model.deleteOrder(this.props.order.key);
  },

  render: function() {
    var sel;
    if(!this.props.order.selected){
      sel = <span>[<a href="#" onClick={this.onSelectClick}>Select</a>]</span>;
    }
    else{
      if(this.props.order.selectedByUid == this.props.model.uid)
        sel = <span>[<a href="#" onClick={this.onDeselectClick}>Deselect</a>]</span>;
      else
        sel = <span>[Selected by {this.props.order.selectedByUserDisplayName}]</span>;
    }
    return (
      <li>
        { sel } { this.formatOrder(this.props.order) } ( { this.props.order.clientName } <ReactIntl.FormattedRelative value={this.props.order.timestamp} /> )
        <span onClick={ this.onDelete }
              style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
          X
        </span>
      </li>
    );
  }
});
module.exports = OrderRow;
