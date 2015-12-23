var React = require('react');
var ReactDOM = require('react-dom');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');

var FacebookLogin = require('./login.jsx');
var NewCoffeeOrder = require('./coffeeorder.jsx');
var PendingOrderList = require('./pendingorderlist.jsx');
var PaidOrderList = require('./paidorderlist.jsx');

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
    this.firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/');
    if(this.firebaseRef.getAuth())
      this.setState({uid: this.firebaseRef.getAuth().uid});
  },

  render: function() {
    var MainApp;
    if(this.state.uid)
      MainApp = <div>
        <NewCoffeeOrder />
        <PendingOrderList uid={ this.state.uid } />
        <PaidOrderList/>
      </div>;
    else
      MainApp = <p>Once logged in, you can start ordering coffees from your friends!</p>
    return (
      <div>
        <FacebookLogin onLogin={this.onLogin} />
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
