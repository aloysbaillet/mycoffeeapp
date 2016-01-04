'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Firebase = require('firebase');
var FirebaseUtil = require('firebase-util');
var ReactFireMixin = require('reactfire');
var ReactIntl = require('react-intl');
var Select = require('react-select');

var Model = require('./model.js');
var FacebookLogin = require('./login.jsx');
var CoffeeOrder = require('./coffeeorder.jsx');
var PendingOrderList = require('./pendingorderlist.jsx');
var PaidOrderList = require('./paidorderlist.jsx');
var CandidateList = require('./candidatelist.jsx');
var UserList = require('./userlist.jsx');
var ChatBox = require('./chatbox.jsx');

var C = require('./constants.js');

Firebase.util.log('MyCoffeeApp starting!');
Firebase.util.logLevel(true);

var MyCoffeeApp = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      uid: null,
      groupId: null,
      groupList: [],
      groupNameToAdd: ''
    };
  },

  onLogin: function(){
    this.model = Model;
    this.model.init(this.firebaseRef);
    if(this.firebaseRef.getAuth()){
      this.setState({uid: this.firebaseRef.getAuth().uid});
      this.firebaseRef
      .child('users')
      .child(this.firebaseRef.getAuth().uid)
      .once('value', function(snapshot){
        this.model.setGroupId(snapshot.val().groupId);
        this.setState({groupId: snapshot.val().groupId})
      }, this);
      if(!this.bound){
        this.bindAsArray(this.firebaseRef.child('userGroups').orderByChild('name'), 'groupList');
        this.bound = true;
      }
    }
    else{
      this.model.setGroupId(null);
      this.setState({uid: null, groupId: null});
    }
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase(C.BASE_FIREBASE_URL);
    this.bound = false;
    this.onLogin();
  },

  updateUserPaymentCacheFromReceipts: function() {
    this.model.updateUserPaymentCacheFromReceipts();
  },

  onGroupSelect: function(option) {
    var _this = this;
    var groupId = option.value;
    this.firebaseRef
    .child('users')
    .child(this.state.uid)
    .update({groupId: groupId}, function(error){
      if(!error){
        _this.model.setGroupId(groupId);
        _this.setState({groupId: groupId});
      }
      else{
        _this.model.setGroupId(null);
        _this.setState({groupId: null});
      }
    });
  },

  onGroupNameChange: function(e) {
    this.setState({groupNameToAdd: e.target.value})
  },

  onGroupAdd: function(e) {
    var users = {};
    users[this.state.uid] = true;
    this.firebaseRef.child('userGroups').push({
      name: this.state.groupNameToAdd,
      users: users
    });
  },

  getGroupSelector: function() {
    var _this = this;
    function createGroupItem(item, index){
      return <li key={index} onClick={_this.onGroupSelect.bind(null, item['.key'])}><a href="#">{item.name}</a></li>
    }
    var groupList = []
    for(var gid in this.state.groupList){
      var group = this.state.groupList[gid];
      groupList.push({value: group['.key'], label: group.name});
    }
    return <div>
      Group: <Select
                  name="groupSelect"
                  value={this.state.groupId}
                  options={groupList}
                  placeholder="Select a Group"
                  onChange={this.onGroupSelect}
              />
      Add a group:
      <input name="groupName" value={this.state.groupNameToAdd} onChange={this.onGroupNameChange}/>
      <button type="button" disabled={!this.state.groupNameToAdd} onClick={this.onGroupAdd}>Add</button>
    </div>;
  },

  render: function() {
    var MainApp;
    if(this.state.uid && this.state.groupId)
      // this key= tricks makes the whole dif refresh on group change!
      MainApp = <div key={this.state.groupId} >
        <h3>Group</h3>
        {this.getGroupSelector()}
        <h3>New Order</h3>
        <CoffeeOrder model={this.model} />
        <h3>Pending Orders</h3>
        <PendingOrderList model={this.model} />
        <h3>Candidates</h3>
        <CandidateList model={this.model} />
        <h3>Users</h3>
        <UserList model={this.model} />
        <h3>Chat</h3>
        <ChatBox model={this.model} />
        <h3>Paid Orders</h3>
        <PaidOrderList model={this.model} />
        <a href="#" onClick={this.updateUserPaymentCacheFromReceipts}>Rebuild User Payment Cache</a>
      </div>;
    else{
      if(!this.state.uid){
        MainApp = <p>Once logged in, you can start ordering coffees from your friends!</p>;
      }
      else if(!this.state.groupId){
        MainApp = this.getGroupSelector();
      }
    }
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
