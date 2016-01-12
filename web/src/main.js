import Firebase from 'firebase';
import React from 'react';
import ReactDOM from 'react-dom';
import {IntlProvider} from 'react-intl';
import Select from 'react-select';
import {PageHeader, Panel, Input, Button} from 'react-bootstrap';

// for iOS
if (!global.Intl) {
  require('intl');
  require('intl/locale-data/jsonp/en.js');
}

import Model from './model.js';
import FacebookLogin from './login.js';
import GroupSelect from './groupselect.js';
import CoffeeOrder from './coffeeorder.js';
import PendingOrderList from './pendingorderlist.js';
import PaidOrderList from './paidorderlist.js';
import CandidateList from './candidatelist.js';
import UserList from './userlist.js';
import ChatBox from './chatbox.js';
import C from './constants.js';

var MyCoffeeApp = React.createClass({

  getInitialState: function() {
    return {
      uid: null,
      groupId: null,
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
    }
    else{
      this.model.setGroupId(null);
      this.setState({uid: null, groupId: null});
    }
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase(C.BASE_FIREBASE_URL);
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
        <Input type="text" placeholder="New Group" value={this.state.groupNameToAdd} onChange={this.onGroupNameChange}/>
        <span className="input-group-btn">
          <Button disabled={!this.state.groupNameToAdd} onClick={this.onGroupAdd}>Add</Button>
        </span>
      </div>
    </div>;
  },

  render: function() {
    var MainApp;
    if(this.state.uid && this.state.groupId)
      // this key={} tricks makes the whole dif refresh on group change!
      MainApp = <div key={this.state.groupId} >
        <Panel header="Group">
          {this.getGroupSelector()}
        </Panel>
        <Panel header="New Order" bsStyle="primary">
          <CoffeeOrder model={this.model} />
        </Panel>
        <Panel header="Pending Orders" bsStyle="info">
          <PendingOrderList model={this.model} />
        </Panel>
        <Panel header="Candidates" bsStyle="info">
          <CandidateList model={this.model} />
        </Panel>
        <Panel header="Users">
          <UserList model={this.model} />
        </Panel>
        <Panel header="Chat">
          <ChatBox model={this.model} />
        </Panel>
        <Panel header="Paid Orders">
          <PaidOrderList model={this.model} />
        </Panel>
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
        <PageHeader>My Coffee App</PageHeader>
        <FacebookLogin onLogin={this.onLogin} model={this.model} />
        {MainApp}
      </div>
    );
  }
});

ReactDOM.render(
    <IntlProvider locales={['en-AU', 'en-US']}>
        <MyCoffeeApp />
    </IntlProvider>,
    document.getElementById('MyCoffeeApp')
);
