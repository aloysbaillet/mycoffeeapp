'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Firebase = require('firebase');
var FirebaseUtil = require('firebase-util');
var ReactFireMixin = require('reactfire');
var ReactIntl = require('react-intl');
var Select = require('react-select');
var ReactBootstrap = require('react-bootstrap');

// for iOS
if (!global.Intl) {
  require('intl');
  require('intl/locale-data/jsonp/en.js');
}

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
      <span>
        <Select
          name="groupSelect"
          value={this.state.groupId}
          options={groupList}
          placeholder="Select a Group"
          onChange={this.onGroupSelect}
          />
      </span>
      <div className="input-group pull-right col-xs-2">
        <ReactBootstrap.Input type="text" placeholder="New Group" value={this.state.groupNameToAdd} onChange={this.onGroupNameChange}/>
        <span className="input-group-btn">
          <ReactBootstrap.Button disabled={!this.state.groupNameToAdd} onClick={this.onGroupAdd}>Add</ReactBootstrap.Button>
        </span>
      </div>
    </div>;
  },

  render: function() {
    var MainApp;
    if(this.state.uid && this.state.groupId)
      // this key={} tricks makes the whole dif refresh on group change!
      MainApp = <div key={this.state.groupId} >
        <ReactBootstrap.Panel header="Group">
          {this.getGroupSelector()}
        </ReactBootstrap.Panel>
        <ReactBootstrap.Panel header="New Order" bsStyle="primary">
          <CoffeeOrder model={this.model} />
        </ReactBootstrap.Panel>
        <ReactBootstrap.Panel header="Pending Orders" bsStyle="info">
          <PendingOrderList model={this.model} />
        </ReactBootstrap.Panel>
        <ReactBootstrap.Panel header="Candidates" bsStyle="info">
          <CandidateList model={this.model} />
        </ReactBootstrap.Panel>
        <ReactBootstrap.Panel header="Users">
          <UserList model={this.model} />
        </ReactBootstrap.Panel>
        <ReactBootstrap.Panel header="Chat">
          <ChatBox model={this.model} />
        </ReactBootstrap.Panel>
        <ReactBootstrap.Panel header="Paid Orders">
          <PaidOrderList model={this.model} />
        </ReactBootstrap.Panel>
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
        <ReactBootstrap.PageHeader>My Coffee App</ReactBootstrap.PageHeader>
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
