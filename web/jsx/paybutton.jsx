var React = require('react');
var Firebase = require('firebase');

var C = require('./constants.js');

var PayButton = React.createClass({
  getInitialState: function() {
    return {
      numSelected: 0,
    };
  },

  componentWillMount: function() {
    var orderListRef = this.props.model.firebaseRef.child('orderList').child('pendingSelection');
    this.ref = orderListRef.orderByChild('selectedByUid').equalTo(this.props.model.uid);
    this.ref.on('value', this.onSelected);
  },

  componentWillUnmount: function() {
    var orderListRef = this.props.model.firebaseRef.child('orderList').child('pendingSelection');
    this.ref.off('value', this.onSelected);
  },

  onSelected: function(snapshot) {
    var numSelected = 0;
    var myPendingSelection = snapshot.val();
    for(var i in myPendingSelection){
      if(myPendingSelection[i].selected)
        numSelected += 1;
    }
    this.setState({numSelected: numSelected});
  },

  onClick: function() {
    this.props.model.paySelectedOrders(this.props.payerId, this.props.payerDisplayName);
  },

  render: function() {
    var isMePaying = this.props.payerId == this.props.model.uid;
    if(this.state.numSelected){
      var payMsg = isMePaying ? "Pay " : "Make " + this.props.payerDisplayName + " pay ";
      return (
        <a href="#" onClick={this.onClick}>{payMsg} for { this.state.numSelected } coffees</a>
      );
    }
    else{
      if(isMePaying)
        return (
          <span>Select an order to pay</span>
        );
      else {
        return null;
      }
    }
  }
});
module.exports = PayButton;
