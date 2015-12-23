var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
var Select = require('react-select');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      coffeeType:"",
      coffeeTypeOptions: [],
      sugar:"",
      sugarOptions: [],
      milk:"",
      milkOptions: []
    };
  },

  onCoffeeTypeListValue: function(snapshot) {
    var options = [];
    var value = snapshot.val();
    for(i in value){
      var coffeeType = value[i];
      options.push({ label: coffeeType.name,
                     value: coffeeType.shortName });
    }
    this.setState({coffeeTypeOptions: options});
  },

  onCoffeeTypeChange: function(value){
    this.setState({coffeeType: value.value})
  },

  onSugarListValue: function(snapshot) {
    var options = [];
    var value = snapshot.val();
    for(i in value){
      var sugar = value[i];
      options.push({ label: sugar.name,
                     value: sugar.quantity });
    }
    this.setState({sugarOptions: options});
  },

  onSugarChange: function(value){
    this.setState({sugar: value.value})
  },

  onMilkListValue: function(snapshot) {
    var options = [];
    var value = snapshot.val();
    for(i in value){
      var milk = value[i];
      options.push({ label: milk.name,
                     value: milk.name });
    }
    this.setState({milkOptions: options});
  },

  onMilkChange: function(value){
    this.setState({milk: value.value})
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if(this.state.coffeeType == "")
      return;
    firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeOrderList/items/');

    var item = {
      coffeeType: this.state.coffeeType,
      sugar: this.state.sugar,
      milk: this.state.milk,
      uid: firebaseRef.getAuth().uid,
      displayName: firebaseRef.getAuth().facebook.displayName,
      timestamp: Firebase.ServerValue.TIMESTAMP
    }
    firebaseRef.push(item);
  },

  componentWillMount: function() {
    firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeData/');
    firebaseRef.child("coffeeTypeList").on("value", this.onCoffeeTypeListValue);
    firebaseRef.child("sugarTypeList").on("value", this.onSugarListValue);
    firebaseRef.child("milkTypeList").on("value", this.onMilkListValue);
  },

  render: function() {
    return (
      <form onSubmit={ this.handleSubmit }>
        <Select
            name="coffeeTypeSelect"
            value={this.state.coffeeType}
            options={this.state.coffeeTypeOptions}
            placeholder="Select Coffee Type"
            onChange={this.onCoffeeTypeChange}
        />
        <Select
            name="sugarSelect"
            value={this.state.sugar}
            options={this.state.sugarOptions}
            placeholder="Select Sugar"
            onChange={this.onSugarChange}
        />
        <Select
            name="milkSelect"
            value={this.state.milk}
            options={this.state.milkOptions}
            placeholder="Select Milk"
            onChange={this.onMilkChange}
        />
        <button>Order</button>
      </form>
    );
  }
});
