import React from 'react';
import ReactFireMixin from 'reactfire';
import firebase from 'firebase';
import ReactIntl from 'react-intl';
import moment from 'moment';
import {FormGroup, ListGroupItem, Button, Checkbox, InputGroup} from 'react-bootstrap';

import PayButton from './paybutton.js';
import FormattedDate from './formatteddate';

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

  onSelectChange: function(e){
    e.preventDefault();
    this.props.model.selectOrder(this.props.order['.key'], e.target.checked);
  },

  onDelete: function(){
    this.props.model.deleteOrder(this.props.order['.key']);
  },

  render: function() {
    var sel = this.props.order.selected ? true : false;
    var readOnly = false;
    var msg = '';
    if(this.props.order.selected && this.props.order.selectedByUid != this.props.model.uid){
      readOnly = true;
      msg = '[selected by ' + this.props.order.selectedByUserDisplayName + ']';
    }
    var payment;
    if(this.props.order.lastPayment === 0)
      payment = <span>never paid!</span>;
    else
      payment = <span>last payment: <FormattedDate value={this.props.order.lastPayment}/></span>;
    var label =
    <span>{msg} {this.formatOrder(this.props.order)}
      &nbsp;for {this.props.order.clientName}
      &nbsp;({moment(this.props.order.timestamp).fromNow()},
      credit: {this.props.order.credit}, {payment})
    </span>;
    return (
      <ListGroupItem>
        <InputGroup>
          <Checkbox checked={sel} onChange={this.onSelectChange} readOnly={readOnly}>{label}</Checkbox>
          <PayButton model={this.props.model} payerId={this.props.order.uid} payerDisplayName={this.props.order.clientName}/>
          <InputGroup.Button>
            <Button bsStyle="danger" onClick={this.onDelete}>Cancel</Button>
          </InputGroup.Button>
        </InputGroup>
      </ListGroupItem>
    );
  }
});
module.exports = OrderRow;
