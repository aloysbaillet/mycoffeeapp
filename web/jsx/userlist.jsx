var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var FirebaseUtil = require('firebase-util');
var ReactIntl = require('react-intl');
var _ = require('underscore');

var UserList = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      users: [],
      userPaymentCache: []
    };
  },

  componentWillMount: function() {
    this.bindAsArray(this.props.model.firebaseRef.child('users'), 'users');
    this.bindAsArray(this.props.model.firebaseRef.child('userPaymentCache'), 'userPaymentCache');
  },

  getUserList: function() {
    var userList = [];
    for(var i in this.state.users){
      var user = _.extend(this.state.users[i], {});
      var cache = this.state.userPaymentCache[i] || {credit:0, lastPayment: 0};
      user.credit = cache.credit;
      user.lastPayment = cache.lastPayment;
      userList.push(user);
    }
    userList.sort(function(a, b) {
      if(a.credit == b.credit){
        return a.lastPayment < b.lastPayment ? -1 : (a.lastPayment > b.lastPayment ? 1 : 0)
      }
      return a.credit < b.credit ? -1 : 1;
    });
    return userList;
  },

  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      var payment;
      if(item.lastPayment == 0)
        payment = <span>never paid!</span>;
      else
        payment = <span>last payment: <ReactIntl.FormattedDate value={item.lastPayment}/></span>;
      return (
        <li key={index} >{item.displayName} ( credit: {item.credit}, {payment} )</li>
      );
    };
    return (
      <ul>{ this.getUserList().map(createItem) }</ul>
    );
  }
});
module.exports = UserList;
