import Firebase from 'firebase';
import React from 'react';
import ReactDOM from 'react-dom';
import {IntlProvider} from 'react-intl';
import {PageHeader, Panel} from 'react-bootstrap';

// for iOS
if (!global.Intl) {
  require('intl');
  require('intl/locale-data/jsonp/en.js');
}

// Styles
import "react-select/dist/react-select.css";
import 'bootstrap/dist/css/bootstrap.css';

import "!style!css!sass!./styles/main.scss";

// Components
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
  
  onGroupSelect: function(groupId){
    this.setState({groupId: groupId});
    this.model.setGroupId(groupId);
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase(C.BASE_FIREBASE_URL);
    this.onLogin();
  },

  render: function() {
    var MainApp;
    if(this.state.uid && this.state.groupId)
      // this key={} tricks makes the whole dif refresh on group change!
      MainApp = <div key={this.state.groupId} >
        <Panel header="Group">
          <GroupSelect model={this.model} onGroupSelect={this.onGroupSelect} />
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
        MainApp = <Panel header="Group">
          <GroupSelect model={this.model} onGroupSelect={this.onGroupSelect} />
        </Panel>;
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
