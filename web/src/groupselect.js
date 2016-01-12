import React from 'react';
import ReactFireMixin from 'reactfire';

var GroupSelect = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      groupList: [],
      groupNameToAdd: ''
    };
  },

  componentWillMount: function() {
	this.bindAsArray(this.firebaseRef.child('userGroups').orderByChild('name'), 'groupList');
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

  render: function() {
    var _this = this;
    function createGroupItem(item, index){
      return <li key={index} onClick={_this.onGroupSelect.bind(null, item['.key'])}><a href="#">{item.name}</a></li>
    }
    var groupList = [];
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
  }
});
module.exports = GroupSelect;

