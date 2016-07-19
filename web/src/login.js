var React = require('react');
var firebase = require('firebase');
var C = require('./constants.js');

var FacebookLogin = React.createClass({
  getInitialState: function() {
    return {login: null};
  },

  handleFacebookLogin: function(event) {
    var auth = firebase.auth();
    var provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider).then(function(result) {
      console.info('Facebook login done');
    }).catch(function(error) {
      console.error('Facebook login failed! error: '+error);
    });
  },

  handleGoogleLogin: function(event) {
    var auth = firebase.auth();
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(function(result) {
      console.info('Google login done');
    }).catch(function(error) {
      console.error('Google login failed! error: '+error);
    });
  },

  handleLogout: function(event) {
    firebase.auth().signOut();
  },

  render: function() {
    if(this.props.uid)
      return (
        <div className="pull-right">{ this.props.model.userDisplayName } [<a href="#" onClick={this.handleLogout}>Logout</a>]
        </div>
      );
    else{
      return (
        <div>Login with
          <a href="#" data-provider="facebook" onClick={this.handleFacebookLogin}>Facebook</a>
          <a href="#" data-provider="facebook" onClick={this.handleGoogleLogin}>Google</a>
        </div>
      );
    }
  }
});

module.exports = FacebookLogin;
