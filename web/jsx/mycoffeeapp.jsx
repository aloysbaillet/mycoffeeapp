var React = require('react');
var ReactDOM = require('react-dom');
var Firebase = require('firebase');
// var Firebase = require('./firebase-debug.js');
var FirebaseUtil = require('firebase-util');
var ReactIntl = require('react-intl');

var Model = require('./model.js');
var FacebookLogin = require('./login.jsx');
var CoffeeOrder = require('./coffeeorder.jsx');
var PendingOrderList = require('./pendingorderlist.jsx');
var PaidOrderList = require('./paidorderlist.jsx');
var CandidateList = require('./candidatelist.jsx');

var C = require('./constants.js');

// FirebaseUtil.log('MyCoffeeApp starting!');
// FirebaseUtil.logLevel(true);

var MyCoffeeApp = React.createClass({

  getInitialState: function() {
    return {
      uid: null
    };
  },

  onLogin: function(uid){
    this.componentWillMount();
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase(C.BASE_FIREBASE_URL);
    if(this.firebaseRef.getAuth())
      this.setState({uid: this.firebaseRef.getAuth().uid});
    else
      this.setState({uid: null});
    this.model = Model;
    this.model.init(this.firebaseRef);
  },

  updateUserPaymentCacheFromReceipts: function() {
    this.model.updateUserPaymentCacheFromReceipts();
  },

  render: function() {
    var MainApp;
    if(this.state.uid)
      MainApp = <div>
        <h3>New Order</h3>
        <CoffeeOrder model={this.model} />
        <h3>Pending Orders</h3>
        <PendingOrderList model={this.model} />
        <h3>Candidates</h3>
        <CandidateList model={this.model} />
        <h3>Paid Orders</h3>
        <PaidOrderList model={this.model} />
        <a href="#" onClick={this.updateUserPaymentCacheFromReceipts}>Rebuild User Payment Cache</a>
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
    <ReactIntl.IntlProvider locales={['en-AU', 'en-US']}>
        <MyCoffeeApp />
    </ReactIntl.IntlProvider>,
    document.getElementById('MyCoffeeApp')
);
