var React = require('react');
var Firebase = require('firebase');
var C = require('./constants.js');

var FacebookLogin = React.createClass({
  componentWillMount: function() {
    if(this.props.model.firebaseRef.getAuth())
      this.setState( {login: this.props.model.firebaseRef.getAuth().facebook.displayName } );

    var _this = this;
    this.props.model.firebaseRef.onAuth(function(authData) {
      _this.handleAuth(null, authData);
    });
  },

  getInitialState: function() {
    return {login: null};
  },

  handleAuth: function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
      this.setState( {login: null} );
      this.props.onLogin(null);
    } else {
      if(authData){
        this.setState( {login: authData.facebook.displayName} );
        this.props.onLogin(authData.uid);
      }
      else{
        this.setState( {login: null} );
        this.props.onLogin(null);
      }
    }
  },

  handleLogin: function(event) {
    this.props.model.firebaseRef.authWithOAuthPopup("facebook", this.handleAuth)
  },

  handleLogout: function(event) {
    this.props.model.firebaseRef.unauth();
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

module.exports = FacebookLogin;
