var React = require('react');
var ReactIntl = require('react-intl');

var FormattedDate = React.createClass({
  render: function() {
    return (
      <span>
        <ReactIntl.FormattedDate value={this.props.value} weekday="long"/>&nbsp;
        <ReactIntl.FormattedDate value={this.props.value}/>&nbsp;
        at <ReactIntl.FormattedTime value={this.props.value} hour="numeric" minute="numeric"/>
      </span>
    );
  }
});
module.exports = FormattedDate;
