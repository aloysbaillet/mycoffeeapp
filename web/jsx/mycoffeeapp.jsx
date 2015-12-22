var React = require('react');
var ReactDOM = require('react-dom');
var ReactFireMixin = require('reactfire');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');

var FacebookLogin = require('./login.jsx');
var NewCoffeeOrder = require('./coffeeorder.jsx');
var CoffeeOrderList = require('./orderlist.jsx');

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
    this.bindAsArray(this.firebaseRef.limitToLast(25), 'items', this.cancelCallback);
  },

  onChange: function(e) {
    this.setState({text: e.target.value});
  },

  removeItem: function(key) {
    this.firebaseRef.child(key).remove();
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
        <CoffeeOrderList items={ this.state.items } removeItem={ this.removeItem } />
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
