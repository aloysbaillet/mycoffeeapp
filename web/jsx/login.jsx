var React = require('react');
var Firebase = require('firebase');

module.exports = React.createClass({
  componentWillMount: function() {
    this.firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/');
    if(this.firebaseRef.getAuth())
      this.setState( {login: this.firebaseRef.getAuth().facebook.displayName } );
  },

  getInitialState: function() {
    return {login: null};
  },

  handleAuth: function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
      this.setState( {login: null} );
      this.props.onLogin(false);
    } else {
      this.setState( {login: authData.facebook.displayName} );
      this.props.onLogin(true);
    }
  },

  handleLogin: function(event) {
    this.firebaseRef.authWithOAuthPopup("facebook", this.handleAuth)
  },

  handleLogout: function(event) {
    this.firebaseRef.unauth();
    this.setState( {login: null} );
    this.props.onLogin(false);
  },

  render: function() {
    if(this.state.login)
      return (
        <p>Logged in as { this.state.login } [<a href="#" onClick={this.handleLogout}>Logout</a>]
        </p>
      );
    else
      return (
        <p>Login with <a href="#" data-provider="facebook" onClick={this.handleLogin}>Facebook</a>
        </p>
      );
  }
});
