var React = require('react');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');
var ReactFireMixin = require('reactfire');
var C = require('./constants.js');

var OrderRow = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      order: {}
    };
  },

  componentWillMount: function() {
    this.bindAsObject(this.props.orderRef, 'order');
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

  onSelectClick: function(e){
    this.props.model.selectOrder(this.props.orderRef.key(), true);
  },

  onDeselectClick: function(e){
    this.props.model.selectOrder(this.props.orderRef.key(), false);
  },

  onDelete: function(){
    this.orderRef.set(null);
  },

  render: function() {
    var sel;
    if(!this.state.order.selected){
      sel = <span>[<a href="#" onClick={this.onSelectClick}>Select</a>]</span>;
    }
    else{
      if(this.state.order.selectedByUid == this.props.model.uid)
        sel = <span>[<a href="#" onClick={this.onDeselectClick}>Deselect</a>]</span>;
      else
        sel = <span>[Selected by {this.state.order.selectedByUserDisplayName}]</span>;
    }
    return (
      <li>
        { sel } { this.formatOrder(this.state.order) } ( { this.state.order.clientName } <ReactIntl.FormattedRelative value={this.state.order.timestamp} /> )
        <span onClick={ this.onDelete }
              style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
          X
        </span>
      </li>
    );
  }
});
module.exports = OrderRow;
