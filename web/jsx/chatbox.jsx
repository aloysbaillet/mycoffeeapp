var React = require('react');
var ReactFireMixin = require('reactfire');
var TimeAgo = require('react-timeago');

var ChatMessages = React.createClass({
    render() {
        return <ul>{this.renderMessages()}</ul>;
    },

    renderMessages() {
        return this.props.messages.map(function (message) {
            return <li key={message['.key']}>
                <strong>{message.userDisplayName} (<TimeAgo date={message.timestamp} />)</strong>:
                {message.text}
            </li>
        });
    }
});

var ChatInput = React.createClass({
  sendMessage(e) {
    e.preventDefault();
    var message = this.refs.input.value;
    this.props.model.newChatMessage(message);
    this.refs.input.value = '';
  },

  render() {
    return <form onSubmit={this.sendMessage}>
        <input ref="input" />
    </form>;
  }
});

var ChatBox = React.createClass({
  mixins: [ReactFireMixin],

  componentWillMount() {
    this.bindAsArray(this.props.model.groupRef.child('messages').limitToLast(100), 'messages');
  },

  getInitialState() {
    return {
      messages: []
    };
  },

  render() {
    return <div className="">
      <ChatMessages messages={this.state.messages} />
      <ChatInput model={this.props.model} />
    </div>;
  }
});
module.exports = ChatBox;
