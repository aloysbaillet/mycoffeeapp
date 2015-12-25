var React = require('react');
var ReactDOM = require('react-dom');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');

var Model = require('./model.js');
var FacebookLogin = require('./login.jsx');
var CoffeeOrder = require('./coffeeorder.jsx');
var PendingOrderList = require('./pendingorderlist.jsx');
var PaidOrderList = require('./paidorderlist.jsx');

var C = require('./constants.js');

var MyCoffeeApp = React.createClass({

  getInitialState: function() {
    return {
      uid: null
    };
  },

  onLogin: function(uid){
    this.setState({
      uid: uid
    });
    this.componentWillMount();
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase(C.BASE_FIREBASE_URL);
    if(this.firebaseRef.getAuth())
      this.setState({uid: this.firebaseRef.getAuth().uid});
    this.model = Model;
    this.model.init(this.firebaseRef,
                    this.firebaseRef.getAuth().uid,
                    this.firebaseRef.getAuth().facebook.displayName);
  },

  render: function() {
    var MainApp;
    if(this.state.uid)
      MainApp = <div>
        <h3>My Order</h3>
        <CoffeeOrder model={this.model} />
        <h3>Pending Orders</h3>
        <PendingOrderList model={this.model} />
        <h3>Paid Orders</h3>
        <PaidOrderList model={this.model} />
      </div>;
    else
      MainApp = <p>Once logged in, you can start ordering coffees from your friends!</p>
    return (
      <div>
        <FacebookLogin onLogin={this.onLogin} model={this.model} />
        {MainApp}
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
