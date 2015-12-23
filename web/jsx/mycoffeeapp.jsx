var React = require('react');
var ReactDOM = require('react-dom');
var ReactFireMixin = require('reactfire');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');

var FacebookLogin = require('./login.jsx');
var NewCoffeeOrder = require('./coffeeorder.jsx');
var PendingOrderList = require('./pendingorderlist.jsx');
var PaidOrderList = require('./paidorderlist.jsx');

var MyCoffeeApp = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      items: [],
      text: ''
    };
  },

  cancelCallback: function(error){
    this.setState({
      items: [],
      text: ''
    });
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeOrderList/items/');
    this.bindAsArray(this.firebaseRef.orderByChild('paidBy').equalTo(null), 'items', this.cancelCallback);
  },

  addItem: function(data) {
    data["uid"] = this.firebaseRef.getAuth().uid;
    data["displayName"] = this.firebaseRef.getAuth().facebook.displayName;
    data["timestamp"] = Firebase.ServerValue.TIMESTAMP;
    this.firebaseRefs['items'].push(data);
  },

  render: function() {
    return (
      <div>
        <FacebookLogin />
        <NewCoffeeOrder items={ this.state.items } addItem={ this.addItem } />
        <PendingOrderList
          items={ this.state.items }
          removeItem={ this.removeItem }
          uid={ this.firebaseRef.getAuth() ? this.firebaseRef.getAuth().uid : null }
        />
        <PaidOrderList/>
      </div>
    );
  }
});

ReactDOM.render(
    <ReactIntl.IntlProvider locale="en">
        <MyCoffeeApp />
    </ReactIntl.IntlProvider>,
    document.getElementById('MyCoffeeApp')
);
