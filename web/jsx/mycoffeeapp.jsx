var React = require('react');
var ReactDOM = require('react-dom');
var ReactFireMixin = require('reactfire');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');

var FacebookLogin = React.createClass({
  getInitialState: function() {
    return {login: null};
  },
  handleAuth: function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
      this.setState( {login: null} );
    } else {
      console.log("Authenticated successfully with payload:", authData);
      this.setState( {login: authData.facebook.displayName} );
      this.props.items.reset();
    }
  },
  handleLogin: function(event) {
    this.firebaseRef.authWithOAuthPopup("facebook", this.handleAuth)
  },
  handleLogout: function(event) {
    this.firebaseRef.unauth();
    this.setState( {login: null} );
  },
  render: function() {
    this.firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/');
    if(this.firebaseRef.getAuth())
      return (
        <p>Logged in as { this.firebaseRef.getAuth().facebook.displayName } [<a href="#" onClick={this.handleLogout}>Logout</a>]
        </p>
      );
    else
      return (
        <p>Login with <a href="#" data-provider="facebook" onClick={this.handleLogin}>Facebook</a>
        </p>
      );
  }
});

var CoffeeOrderList = React.createClass({
  mixins: [ReactIntl.IntlMixin],
  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <li key={ index }>
          { item.text } ( { item.displayName } <ReactIntl.FormattedRelative value={item.timestamp} /> )
          <span onClick={ _this.props.removeItem.bind(null, item['.key']) }
                style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
            X
          </span>
        </li>
      );
    };
    return <ul>{ this.props.items.map(createItem) }</ul>;
  }
});

var MyCoffeeApp = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      items: [],
      text: ''
    };
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeOrderList/items/');
    this.bindAsArray(this.firebaseRef.limitToLast(25), 'items');
  },

  onChange: function(e) {
    this.setState({text: e.target.value});
  },

  removeItem: function(key) {
    this.firebaseRef.child(key).remove();
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if (this.state.text && this.state.text.trim().length !== 0) {
      this.firebaseRefs['items'].push({
        text: this.state.text,
        uid: this.firebaseRef.getAuth().uid,
        displayName: this.firebaseRef.getAuth().facebook.displayName,
        timestamp: Firebase.ServerValue.TIMESTAMP
      });
      this.setState({
        text: ''
      });
    }
  },

  render: function() {
    return (
      <div>
        <FacebookLogin/>
        <CoffeeOrderList items={ this.state.items } removeItem={ this.removeItem } />
        <form onSubmit={ this.handleSubmit }>
          <input onChange={ this.onChange } value={ this.state.text } />
          <button>{ 'Add #' + (this.state.items.length + 1) }</button>
        </form>
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
