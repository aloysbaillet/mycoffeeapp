var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var ReactIntl = require('react-intl');
var ReactBootstrap = require('react-bootstrap');
var _ = require('underscore');

var FormattedDate = require('./formatteddate');

var UserList = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      orderList: []
    };
  },

  onExpand: function() {
    var ol = []
    for(var orderId in this.props.receipt.orderList){
      this.props.model.groupRef
      .child('orderList')
      .child('paid')
      .child(orderId)
      .once('value', function(snapshot){
        var order = snapshot.val();
        ol.push(order);
        this.setState({orderList: ol})
      }, this);
    }
  },

  renderOrder() {
    var orders;
    var _this = this;
    if(this.state.orderList.length > 0){
      var createItem = function(item, index) {
        return (
          <li key={index} >{item.clientName} ( {_this.props.model.formatOrder(item)} )</li>
        );
      };
      orders = <ul>{this.state.orderList.map(createItem)}</ul>
    }
    else{
      orders = <a href="#" onClick={this.onExpand}>Expand Orders</a>
    }
    return <span>{this.props.receipt.cost}&nbsp;
      <ReactIntl.FormattedPlural value={this.props.receipt.cost}
        one="coffee"
        other="coffees"
      />&nbsp;
      paid by {this.props.receipt.payerName} on&nbsp;
      <FormattedDate value={this.props.receipt.timestamp}/>&nbsp;
      {orders}
    </span>;
  },

  render: function() {
    var _this = this;
    return <div className="clearfix">
      <span>
        {this.renderOrder()}
      </span>
      <span className="pull-right">
        <ReactBootstrap.Button
          bsStyle="danger"
          onClick={ ()=> this.props.model.toggleOrderCancellation(this.props.receipt)}>
            {this.props.receipt.cancelled?"Restore":"Cancel"}
        </ReactBootstrap.Button>
      </span>
    </div>;
  }
});
module.exports = UserList;
