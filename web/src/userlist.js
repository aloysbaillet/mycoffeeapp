var React = require('react');
var createReactClass = require('create-react-class');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var ReactIntl = require('react-intl');
var _ = require('underscore');
var ReactBootstrap = require('react-bootstrap');

var FormattedDate = require('./formatteddate');


var UserList = createReactClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      users: [],
      userPaymentCache: [],
      permittedUsers: []
    };
  },

  componentWillMount: function() {
    this.bindAsArray(this.props.model.firebaseRef.child('users'), 'users');
    this.bindAsObject(this.props.model.groupRef.child('userPaymentCache'), 'userPaymentCache');
    this.bindAsArray(this.props.model.firebaseRef.child('userGroups').child(this.props.model.groupId).child('users'), 'permittedUsers');
  },

  getUserList: function() {
    var userList = [];
    var lookup = {};
    this.state.permittedUsers.forEach(function(elem, idx, arr) {
      lookup[elem['.key']] = elem['.value'];
    });
    for(var i in this.state.users){
      var user = _.extend(this.state.users[i], {});
      if (lookup[user['.key']]) {
        var cache = this.state.userPaymentCache[user['.key']] || { credit: 0, lastPayment: 0 };
        user.credit = cache.credit;
        user.lastPayment = cache.lastPayment;
        userList.push(user);
      }
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
        payment = <span>last payment on <FormattedDate value={item.lastPayment}/></span>;
      return (
        <ReactBootstrap.ListGroupItem key={index} >{item.displayName} ( credit: {item.credit}, {payment} )</ReactBootstrap.ListGroupItem>
      );
    };
    return (
      <ReactBootstrap.ListGroup>{ this.getUserList().map(createItem) }</ReactBootstrap.ListGroup>
    );
  }
});
module.exports = UserList;
