var React = require('react');
var createReactClass = require('create-react-class');
var ReactFireMixin = require('reactfire');
var Button = require('react-bootstrap').Button;

var CoffeeOrder = createReactClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      coffeeType:'',
      coffeeTypeList: [],
      sugar:0,
      sugarList: [],
      milk:'',
      milkList: [],
      uid:'',
      userDisplayName:'',
      userList:[],
      userMap:{},
      permittedUsers:[]
    };
  },

  componentWillMount: function() {
    var coffeeDataRef = this.props.model.firebaseRef.child('coffeeData');
    this.bindAsArray(coffeeDataRef.child('coffeeTypeList'), 'coffeeTypeList');
    this.bindAsArray(coffeeDataRef.child('sugarTypeList'), 'sugarList');
    this.bindAsArray(coffeeDataRef.child('milkTypeList'), 'milkList');

    this.bindAsArray(this.props.model.firebaseRef.child('userGroups').child(this.props.model.groupId).child('users'), 'permittedUsers');
    this.props.model.firebaseRef.child('users').on('value', this.onUserListValue);
    this.setUser(this.props.model.uid, this.props.model.userDisplayName);
  },

  componentWillUnmount: function() {
    this.props.model.firebaseRef.child('users').off('value', this.onUserListValue);
  },

  onCoffeeTypeChange: function(event){
    var coffeeType = event.target.value || '';
    this.setState({coffeeType: coffeeType});
    this.props.model.firebaseRef.child('userPreferences').child(this.state.uid).update({preferredCoffeeType: coffeeType});
  },

  onSugarChange: function(event){
    var sugar = parseInt(event.target.value) || 0;
    this.setState({sugar: sugar});
    this.props.model.firebaseRef.child('userPreferences').child(this.state.uid).update({preferredSugar: sugar});
  },

  onMilkChange: function(event){
    var milk = event.target.value || '';
    this.setState({milk: milk});
    this.props.model.firebaseRef.child('userPreferences').child(this.state.uid).update({preferredMilk: milk});
  },

  getUserList: function() {
    var lookup = {};
    this.state.permittedUsers.forEach(function(elem, idx, arr) {
      lookup[elem['.key']] = elem['.value'];
    });
    var users = [];
    this.state.userList.forEach(function(elem, idx, arr){
      if (lookup[elem.value])
        users.push(elem);
    });
    return users;
  },

  onUserListValue: function(snapshot) {
    var users = [];
    var userMap = snapshot.val();
    var options = [];
    for(var i in userMap){
      options.push({
        label: userMap[i].displayName,
        value: i
      });
    }
    options.sort(function(a, b) {
        return a.label < b.label ? -1 : 1;
      });
    this.setState({userList: options, userMap: userMap});
  },

  setUser: function(uid, userDisplayName){
    this.setState({uid: uid,
                   userDisplayName: userDisplayName});
    if(!uid){
      console.log('setUser received uid=', uid);
      return;
    }
    this.props.model.firebaseRef.child('userPreferences').child(uid).once('value', function(snapshot){
      var u = snapshot.val();
      if(!u){
        this.setState({coffeeType: '',
                       sugar: 0,
                       milk: ''});
        return;
      }
      this.setState({coffeeType: u.preferredCoffeeType || '',
                      sugar: u.preferredSugar || 0,
                      milk: u.preferredMilk || ''});
    }, this);
  },

  onUserChange: function(event){
    var value = event.target.value;
    if(value)
      this.setUser(value, this.state.userMap[value].displayName);
    else
      this.setUser(this.props.model.uid, this.props.model.userDisplayName);
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if(this.state.coffeeType == ''){
      console.log("Order cancelled: empty coffee type!")
      return;
    }
    var uid = this.state.uid;
    var userDisplayName = this.state.userDisplayName;
    if(!uid){
      uid = this.props.model.uid;
      userDisplayName = this.props.model.userDisplayName;
    }
    this.props.model.createOrder(this.state.coffeeType,
                                 this.state.sugar,
                                 this.state.milk,
                                 uid,
                                 userDisplayName);
  },

  render: function() {
    return (
      <form onSubmit={this.handleSubmit} className="form-inline">
        <select className="form-control" value={this.state.uid} onChange={this.onUserChange}>
          <option value=""/>
          {this.getUserList().map(function(item){
            return <option key={item.value} value={item.value}>{item.label}</option>;
          })}
        </select>
        <select className="form-control" value={this.state.milk} onChange={this.onMilkChange}>
          <option value=""/>
          {this.state.milkList.map(function(item){
            return <option key={item.name} value={item.name}>{item.name}</option>;
          })}
        </select>
        <select className="form-control" value={this.state.coffeeType} onChange={this.onCoffeeTypeChange}>
          <option value=""/>
          {this.state.coffeeTypeList.map(function(item){
            return <option key={item.name} value={item.name}>{item.name}</option>;
          })}
        </select>
        <select className="form-control" value={this.state.sugar} onChange={this.onSugarChange}>
          {this.state.sugarList.map(function(item){
            return <option key={item.quantity} value={item.quantity}>{item.quantity}</option>;
          })}
        </select>
        <Button bsStyle="success" onClick={this.handleSubmit} >Order</Button>
      </form>
    );
  }
});

module.exports = CoffeeOrder;
