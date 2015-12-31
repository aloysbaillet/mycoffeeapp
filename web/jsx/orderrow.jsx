var React = require('react');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');
var ReactFireMixin = require('reactfire');
var TimeAgo = require('react-timeago');

var Checkbox = require('./check.jsx');

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

  onSelectChange: function(sel, e){
    this.props.model.selectOrder(this.props.order['.key'], sel);
  },

  onDelete: function(){
    this.props.model.deleteOrder(this.props.order['.key']);
  },

  onNextValue: function(oldValue, props){
    if(oldValue == null){
      return true;
    }
    return !oldValue;
  },

  render: function() {
    var sel;
    var msg = '';
    if(!this.props.order.selected){
      sel = false;
    }
    else{
      if(this.props.order.selectedByUid == this.props.model.uid)
        sel = true;
      else{
        sel = null;
        msg = '[selected by ' + this.props.order.selectedByUserDisplayName + ']';
      }
    }
    return (
      <li>
        <Checkbox checked={sel} onChange={this.onSelectChange} nextValue={this.onNextValue}>
          {msg}
          { this.formatOrder(this.props.order) } ( { this.props.order.clientName } <TimeAgo date={this.props.order.timestamp} /> )
        </Checkbox>
        <span onClick={ this.onDelete }
              style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
          X
        </span>
      </li>
    );
  }
});
module.exports = OrderRow;
