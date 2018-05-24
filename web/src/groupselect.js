import React from 'react';
var createReactClass = require('create-react-class');
import ReactFireMixin from 'reactfire';
import {FormGroup, FormControl, ControlLabel, Button, Select} from 'react-bootstrap';

var GroupSelect = createReactClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      groupList: [],
      uid: '',
      groupNameToAdd: ''
    };
  },

  componentWillMount: function() {
	  this.bindAsArray(this.props.model.firebaseRef.child('userGroups').orderByChild('name'), 'groupList');
    this.state.uid = this.props.model.uid;
  },

  onGroupSelect: function(event) {
    var groupId = event.target.value;
  	this.props.onGroupSelect(groupId);
  },

  onGroupNameChange: function(e) {
    this.setState({groupNameToAdd: e.target.value})
  },

  onGroupAdd: function(e) {
    var users = {};
    users[this.props.model.uid] = true;
    this.props.model.firebaseRef.child('userGroups').push({
      name: this.state.groupNameToAdd,
      users: users
    });
  },

  render: function() {
    var _this = this;
    function createGroupOption(item, index){
      return <option key={index} value={item.value}>{item.label}</option>
    }
    var groupList = [];
    for(var gid in this.state.groupList){
      var group = this.state.groupList[gid];
      if (group.users[this.state.uid]) {
        groupList.push({ value: group['.key'], label: group.name });
      }
    }
    return <div>
      <FormGroup>
        <ControlLabel>Select a group:</ControlLabel>
        <FormControl componentClass="select" value={this.props.model.groupId || ""} placeholder="Group" onChange={this.onGroupSelect}>
          <option key={-1} value={""}></option>
          {groupList.map(createGroupOption)}
        </FormControl>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Add new group:</ControlLabel>
        <FormControl type="text" placeholder="New Group" value={this.state.groupNameToAdd} onChange={this.onGroupNameChange} />
        <Button disabled={!this.state.groupNameToAdd} onClick={this.onGroupAdd}>Add</Button>
      </FormGroup>
    </div>
  }
});

module.exports = GroupSelect;
