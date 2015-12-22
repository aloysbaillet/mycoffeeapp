var React = require('react');
var ReactDOM = require('react-dom');
var ReactFireMixin = require('reactfire');
var Firebase = require('firebase');
var ReactIntl = require('react-intl');
var Select = require('react-select');

var FacebookLogin = React.createClass({
  mixins: [ReactFireMixin],

  componentWillMount: function() {
    this.firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/');
    if(this.firebaseRef.getAuth())
      this.setState( {login: this.firebaseRef.getAuth().facebook.displayName } );
  },

  getInitialState: function() {
    return {login: null};
  },

  handleAuth: function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
      this.setState( {login: null} );
    } else {
      console.log("Authenticated successfully with payload:", authData);
      this.setState( {login: authData.facebook.displayName} );
    }
  },

  handleLogin: function(event) {
    this.firebaseRef.authWithOAuthPopup("facebook", this.handleAuth)
  },

  handleLogout: function(event) {
    this.firebaseRef.unauth();
    this.setState( {login: null} );
  },

  render: function() {
    if(this.state.login)
      return (
        <p>Logged in as { this.state.login } [<a href="#" onClick={this.handleLogout}>Logout</a>]
        </p>
      );
    else
      return (
        <p>Login with <a href="#" data-provider="facebook" onClick={this.handleLogin}>Facebook</a>
        </p>
      );
  }
});

var CoffeeOrderList = React.createClass({
  mixins: [ReactIntl.IntlMixin],
  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      var milk = "";
      if(item.milk)
        milk = item.milk + " ";
      var sug = "";
      if(item.sugar)
        sug = " with " + item.sugar;
      return (
        <li key={ index }>
          { milk + item.coffeeType + sug } ( { item.displayName } <ReactIntl.FormattedRelative value={item.timestamp} /> )
          <span onClick={ _this.props.removeItem.bind(null, item['.key']) }
                style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
            X
          </span>
        </li>
      );
    };
    return <ul>{ this.props.items.map(createItem) }</ul>;
  }
});


var NewCoffeeOrder = React.createClass({

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
    var item = {
      coffeeType: this.state.coffeeType,
      sugar: this.state.sugar,
      milk: this.state.milk
    }
    this.props.addItem(item);
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

var MyCoffeeApp = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      items: [],
      text: ''
    };
  },

  cancelCallback: function(error){
    this.setState({
      items: [],
      text: ''
    });
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase('https://mycoffeeapp.firebaseio.com/coffeeOrderList/items/');
    this.bindAsArray(this.firebaseRef.limitToLast(25), 'items', this.cancelCallback);
  },

  onChange: function(e) {
    this.setState({text: e.target.value});
  },

  removeItem: function(key) {
    this.firebaseRef.child(key).remove();
  },

  addItem: function(data) {
    data["uid"] = this.firebaseRef.getAuth().uid;
    data["displayName"] = this.firebaseRef.getAuth().facebook.displayName;
    data["timestamp"] = Firebase.ServerValue.TIMESTAMP;
    this.firebaseRefs['items'].push(data);
  },

  render: function() {
    return (
      <div>
        <FacebookLogin />
        <CoffeeOrderList items={ this.state.items } removeItem={ this.removeItem } />
        <NewCoffeeOrder items={ this.state.items } addItem={ this.addItem } />
      </div>
    );
  }
});

ReactDOM.render(
    <ReactIntl.IntlProvider locale="en">
        <MyCoffeeApp />
    </ReactIntl.IntlProvider>,
    document.getElementById('MyCoffeeApp')
);
