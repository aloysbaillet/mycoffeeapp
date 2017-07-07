import firebase from 'firebase';
import React from 'react';
import ReactDOM from 'react-dom';
import {PageHeader, Panel} from 'react-bootstrap';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

// for iOS
if (!global.Intl) {
  require('intl');
  require('intl/locale-data/jsonp/en.js');
}
import * as ReactIntl from 'react-intl';

import auLocale from 'react-intl/locale-data/en.js';
ReactIntl.addLocaleData(auLocale);

// Styles
import "react-select/dist/react-select.css";
import 'bootstrap/dist/css/bootstrap.css';

import "!style!css!sass!./styles/main.scss";

// Components
import CoffeeModel from './model.js';
import FacebookLogin from './login.js';
import GroupSelect from './groupselect.js';
import CoffeeOrder from './coffeeorder.js';
import PendingOrderList from './pendingorderlist.js';
import PaidOrderList from './paidorderlist.js';
import UserList from './userlist.js';
import ChatBox from './chatbox.js';
import C from './constants.js';

var MyCoffeeApp = React.createClass({

  getInitialState: function() {
    return {
      uid: null,
      groupId: null,
      currentTab: 0,
      authDone: false
    };
  },

  componentWillMount: function() {
    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyCIcEq226PG6WLM6pHHDMNN7iSWP64mWNY",
      authDomain: "mycoffeeapp.firebaseapp.com",
      databaseURL: C.BASE_FIREBASE_URL,
      storageBucket: "firebase-mycoffeeapp.appspot.com",
      messagingSenderId: "585668274935"
    };
    firebase.initializeApp(config);

    this.firebaseRef = firebase.database().ref();
    this.model = CoffeeModel;
    var auth = firebase.auth();
    var _this = this;
    auth.onAuthStateChanged(function(user) {
      _this.handleAuth(user);
    }, function(error) {
      console.error(error);
    });
  },

  onTabSelect(index, last) {
    this.setState({currentTab: index});
  },

  onGroupSelect: function(groupId){
    this.setState({groupId: groupId});
    this.model.setGroupId(groupId);
  },

  getDisplayName: function(user) {
    if(!user)
      return '';
    var displayName = user.displayName;
    user.providerData.forEach(function(profile) {
      if(profile.displayName)
        displayName = profile.displayName;
    });
    return displayName;
  },

  handleAuth: function(user) {
    var displayName = this.getDisplayName(user);
    this.model.init(this.firebaseRef, user, displayName);
    if(user) {
      this.firebaseRef
      .child('users')
      .child(user.uid)
      .once('value', function(snapshot){
        this.model.setGroupId(snapshot.val().groupId);
        this.setState({uid: user.uid,
                       groupId: snapshot.val().groupId,
                       authDone: true})
      }, this);
    } else {
      this.model.setGroupId(null);
      this.setState({uid: null, groupId: null, authDone: true});
    }
  },

  render: function() {
    var MainApp;
    var topKey = 'key_' + this.state.uid + '_' + this.state.groupId;
    if(!this.state.authDone){
      MainApp = <button className="btn btn-lg btn-info"><span className='glyphicon-left glyphicon glyphicon-refresh spinning'></span>Authenticating...</button>
    }
    else if(this.state.uid && this.state.groupId){
      // this key={} tricks makes the whole div refresh on group change!
      MainApp =
      <div>
        <FacebookLogin model={this.model} uid={this.model.uid}/>
        <Tabs key={topKey + '_ready'}
            onSelect={this.onTabSelect}
            selectedIndex={this.state.currentTab}>
          <TabList>
            <Tab>Main</Tab>
            <Tab>Orders</Tab>
            <Tab>Chat</Tab>
            <Tab>Groups</Tab>
          </TabList>
          <TabPanel>
            <Panel header="New Order" bsStyle="primary">
              <CoffeeOrder model={this.model} />
            </Panel>
            <Panel header="Pending Orders" bsStyle="info">
              <PendingOrderList model={this.model} />
            </Panel>
            <Panel header="Users">
              <UserList model={this.model} />
            </Panel>
          </TabPanel>
          <TabPanel>
            <Panel header="Paid Orders">
              <PaidOrderList model={this.model} />
            </Panel>
          </TabPanel>
          <TabPanel>
            <Panel header="Chat">
              <ChatBox model={this.model} />
            </Panel>
          </TabPanel>
          <TabPanel>
            <GroupSelect model={this.model} onGroupSelect={this.onGroupSelect} />
          </TabPanel>
        </Tabs>
      </div>
    }
    else{
      if(!this.state.uid){
       MainApp =
       <div>
         <FacebookLogin model={this.model} uid={this.model.uid}/>
         <p key={this.state.uid}>Once logged in, you can start ordering coffees from your friends!</p>
       </div>
      }
      else if(!this.state.groupId){
        MainApp =
        <div>
          <Panel header="Group">
            <FacebookLogin model={this.model} uid={this.model.uid}/>
            <GroupSelect model={this.model} onGroupSelect={this.onGroupSelect} />
          </Panel>
        </div>
      }
    }
    return (
      <div>
        <PageHeader>My Coffee App</PageHeader>
        {MainApp}
      </div>
    );
  }
});

ReactDOM.render(
    <ReactIntl.IntlProvider locale='en'>
        <MyCoffeeApp />
    </ReactIntl.IntlProvider>,
    document.getElementById('MyCoffeeApp')
);
