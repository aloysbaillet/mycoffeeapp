var React = require('react');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');
var ReactFireMixin = require('reactfire');
var ReactBootstrap = require('react-bootstrap');
var moment = require('moment');

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

  onSelectChange: function(){
    this.props.model.selectOrder(this.props.order['.key'], this.refs.selected.getChecked());
  },

  onDelete: function(){
    this.props.model.deleteOrder(this.props.order['.key']);
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
    var label = msg + this.formatOrder(this.props.order)  + " (" + this.props.order.clientName + " " + moment(this.props.order.timestamp).fromNow() + ")";
    return (
      <ReactBootstrap.ListGroupItem>
        <div className="input-group">
          <ReactBootstrap.Input type="checkbox" checked={sel} onChange={this.onSelectChange} ref="selected" label={label} />
          <span className="input-group-btn">
            <ReactBootstrap.Button bsStyle="danger" onClick={this.onDelete}>Cancel</ReactBootstrap.Button>
          </span>
        </div>
      </ReactBootstrap.ListGroupItem>
    );
  }
});
module.exports = OrderRow;
