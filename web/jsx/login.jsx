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
        if(authData.provider == 'facebook')
          this.setState( {login: authData.facebook.displayName} );
        else if (authData.provider == 'google') {
          this.setState( {login: authData.google.displayName} );
        }
        this.props.onLogin();
      }
      else{
        this.setState( {login: null} );
        this.props.onLogin();
      }
    }
  },

  handleFacebookLogin: function(event) {
    this.props.model.firebaseRef.authWithOAuthPopup("facebook", this.handleAuth)
  },

  handleGoogleLogin: function(event) {
    this.props.model.firebaseRef.authWithOAuthPopup("google", this.handleAuth)
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
        <p>Login with <a href="#" data-provider="facebook" onClick={this.handleFacebookLogin}>Facebook</a> <a href="#" data-provider="facebook" onClick={this.handleGoogleLogin}>Google</a>
        </p>
      );
  }
});

module.exports = FacebookLogin;
