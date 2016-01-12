'use strict';

// ! This is a local copy of react-check3 as require('react-check3') fails strangely!

var React  = require('react')
var assign = require('object-assign')

var hasOwn = function(obj, prop){
    return Object.prototype.hasOwnProperty.call(obj, prop)
}

function emptyFn(){}

var DISPLAY_NAME = 'ReactCheck3'

module.exports = React.createClass({

    displayName: DISPLAY_NAME,

    propTypes: {
        shouldSubmit: React.PropTypes.func,
        nextValue   : React.PropTypes.func,
        disabled    : React.PropTypes.bool
    },

    getInitialState: function() {
        var props = this.props
        var hasDefaultValue = hasOwn(props, 'defaultValue')
        var hasDefaultChecked = !hasDefaultValue && hasOwn(props, 'defaultChecked')

        return {
            defaultValue: hasDefaultChecked?
                            props.defaultChecked:
                            props.defaultValue || props.uncheckedValue

        }
    },

    getDefaultProps: function() {

        return {
            'data-display-name': DISPLAY_NAME,

            shouldSubmit: function(value, props) {
                if (!props.name || props.disabled){
                    return false
                }
            },
            defaultCheckboxStyle: {
                display: 'inline-block',
                boxSizing: 'border-box',
                cursor: 'pointer',
                margin: 3
            },

            defaultDisabledCheckboxStyle: {
                opacity: 0.5,
                cursor: 'auto'
            },

            checkboxStyle: null,
            disabledCheckboxStyle: null,

            defaultStyle: {
                display  : 'inline-block',
                boxSizing: 'border-box',
                color    : 'rgb(120, 120, 120)',

                margin: 2
            },

            defaultFocusedStyle: {
            },

            supportIndeterminate: true,
            childrenAfter: true,

            disabled: false,

            nextValue: function(oldValue, props) {
                if (oldValue === props.checkedValue){
                    // checked -> unchecked
                    return props.uncheckedValue
                }

                if (oldValue === props.uncheckedValue){
                    // unchecked -> indeterminate (if supported, otherwise to checked)
                    return props.supportIndeterminate?
                                props.indeterminateValue:
                                props.checkedValue
                }

                if (props.supportIndeterminate && oldValue === props.indeterminateValue){
                    //indeterminate -> checked
                    return props.checkedValue
                }

                return props.uncheckedValue
            },

            checkedValue: true,
            uncheckedValue: false,
            indeterminateValue: null,

            defaultIconStyle: {
            },

            defaultIconProps: {

            },

            iconProps: null,

            iconSize: 13,
            iconWidth: null,
            iconHeight: null,

            // checkedIconSrc: require('../style/checked.png'),
            checkedIconSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAY0lEQVR4Xr2T0QqAIAxFb7EPbV9Wf2oPBedhuCEDL4iCnjNjdkgaamZ02FPNbBfc3yC2CF8izg1ChQomllWYwA97008ASOAgcADmABdd8P+gEjgTIMnhuo0e1gsCwB1Puf07v5tzFWpkt96mAAAAAElFTkSuQmCC",

            // uncheckedIconSrc: require('../style/unchecked.png'),
            uncheckedIconSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAJklEQVR4Xu3TMQEAAAiEQLR/53cwAusT4DYGCCYJZJEVKFDg0zsf1TMEGcWLZyUAAAAASUVORK5CYII=",

            // indeterminateIconSrc: require('../style/indeterminate.png')
            indeterminateIconSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANElEQVR4Xu2TMQoAIBDDUvH/Xz5nV7OccHlAaKENUBikoBYSLdgPlaITjOCm5w7yVwV95wPWUAUe/arBgwAAAABJRU5ErkJggg=="

            //checkedSubmitValue
            //uncheckedSubmitValue
            //indeterminateSubmitValue
        }
    },

    renderCheckbox: function(props) {
        var checkboxProps = this.prepareCheckboxProps(props)
        var input         = this.renderHiddenInput(props)
        var img           = this.renderImg(props)

        return React.createElement("div", React.__spread({},  checkboxProps),
            input,
            img
        )
    },

    render: function(){

        var props    = this.prepareProps(this.props, this.state)
        var checkbox = this.renderCheckbox(props)

        var childrenBefore

        if (props.children){
            childrenBefore = (hasOwn(props, 'childrenBefore') && props.childrenBefore === true) || props.childrenAfter === false
        }

        return props.children?
                React.createElement("div", React.__spread({},  props),
                    childrenBefore? props.children: null,
                    checkbox,
                    childrenBefore? null: props.children
                ):
                checkbox
    },

    renderHiddenInput: function(props) {

        if (props.shouldSubmit === false || (typeof props.shouldSubmit == 'function' && props.shouldSubmit(props.value, props) === false)){
            return
        }

        return React.createElement("input", {type: "hidden", name: props.name, value: props.submitValue})
    },

    renderImg: function(props) {

        var iconProps = this.prepareIconProps(props)

        return React.createElement("img", React.__spread({},  iconProps))
    },

    prepareIconStyle: function(props) {
        var style = assign({}, props.defaultIconStyle)

        var width  = props.iconWidth  || props.iconSize
        var height = props.iconHeight || props.iconSize

        style.width  = width
        style.height = height

        assign(style, props.iconStyle)

        return style
    },

    prepareIconProps: function(props) {
        var iconProps = {
            src    : this.getIconSrc(props.value),
            style  : this.prepareIconStyle(props)
        }

        if (props.iconClassName){
            iconProps.className = props.iconClassName
        }

        if (!props.disabled && !props.children){
            //we have no children, so only include the icon in the focus area
            iconProps.tabIndex = props.tabIndex || 0
        }

        return iconProps
    },

    handleFocus: function(event) {
        this.setState({
            focused: true
        })

        ;(this.props.onFocus || emptyFn)(event)
    },

    handleBlur: function(event) {
        this.setState({
            focused: false
        })

        ;(this.props.onBlur || emptyFn)(event)
    },

    handleClick: function(props, event) {

        if (!props.disabled){
            this.trigger(props.value, event)
        }

        ;(this.props.onClick || emptyFn)(event)
    },

    handleKeyDown: function(props, event) {
        if (event.key == ' '){
            event.preventDefault()
            this.handleClick(props, event)
        }
    },

    trigger: function(value, event) {
        if (!arguments.length){
            value = this.prepareValue(this.props, this.state)
        }

        value = this.props.nextValue(value, this.props)

        ;(this.props.onChange || emptyFn)(value, event)

        if (!hasOwn(this.props, 'value')){
            this.setState({
                defaultValue: value
            })
        }
    },

    getIconSrc: function(value) {
        var props = this.props

        return value === props.checkedValue?
                    props.checkedIconSrc:
                    props.supportIndeterminate && value === props.indeterminateValue?
                        props.indeterminateIconSrc:
                        props.uncheckedIconSrc
    },

    prepareProps: function(thisProps, state) {

        var props = {}

        assign(props, thisProps)

        props.value       = this.prepareValue(props, state)
        props.submitValue = this.prepareSubmitValue(props)
        props.style       = this.prepareStyle(props)

        props.onClick   = this.handleClick.bind(this, props)
        props.onKeyDown = this.handleKeyDown.bind(this, props)

        if (!props.disabled && props.tabIndex == null && props.children){
            //if we have children, we want to also include the children inside the focus area
            props.tabIndex = 0
        }

        props.onFocus = this.handleFocus
        props.onBlur  = this.handleBlur

        return props
    },

    prepareValue: function(props, state) {

        var value

        if (hasOwn(props, 'value')){
            value = props.value
        } else if (hasOwn(props, 'checked')){
            value = props.checked
        } else {
            value = state.defaultValue
        }

        if (value === props.checkedValue){
            return value
        }

        if (props.supportIndeterminate && value === props.indeterminateValue){
            return value
        }

        return props.uncheckedValue
    },

    prepareSubmitValue: function(props) {
        var submitValue

        if (props.value === props.checkedValue){
            submitValue = hasOwn(props, 'checkedSubmitValue')?
                            props.checkedSubmitValue:
                            props.checkedValue

        } else if (props.supportIndeterminate && props.value === props.indeterminateValue){
            submitValue = hasOwn(props, 'indeterminateSubmitValue')?
                            props.indeterminateSubmitValue:
                            props.indeterminateValue
        } else {
            submitValue = hasOwn(props, 'uncheckedSubmitValue')?
                            props.uncheckedSubmitValue:
                            props.uncheckedValue
        }

        return submitValue
    },

    prepareCheckboxProps: function(props) {
        if (!props.children){
            return props
        }

        var defaultDisabledStyle
        var disabledStyle

        if (props.disabled){
            defaultDisabledStyle = props.defaultDisabledCheckboxStyle
            disabledStyle        = props.disabledCheckboxStyle
        }

        var defaultFocusedStyle
        var focusedStyle

        if (this.state.focused){
            defaultFocusedStyle = props.defaultFocusedCheckboxStyle
            focusedStyle        = props.focusedCheckboxStyle
        }

        var defaultStyle = assign({}, props.defaultCheckboxStyle, defaultDisabledStyle, defaultFocusedStyle)
        var style        = assign({}, defaultStyle, props.checkboxStyle, disabledStyle, focusedStyle)

        return {
            style: style
        }
    },

    prepareStyle: function(props) {

        var state = this.state

        //defaultStyle
        var defaultStyle = assign({}, props.defaultStyle)

        if (!props.children){
            assign(defaultStyle, props.defaultCheckboxStyle)
        }

        if (props.disabled){
            assign(defaultStyle, props.defaultDisabledStyle, !props.children? props.defaultDisabledCheckboxStyle: null)
        }

        if (state.focused){
            assign(defaultStyle, props.defaultFocusedStyle, !props.children? props.defaultFocusedCheckboxStyle: null)
        }

        //style
        var style = assign({}, defaultStyle, props.style)

        if (!props.children){
            assign(style, props.checkboxStyle)
        }

        if (props.disabled){
            assign(style, props.disabledStyle, !props.children? props.disabledCheckboxStyle: null)
        }

        if (state.focused){
            assign(style, props.focusedStyle, !props.children? props.focusedCheckboxStyle: null)
        }

        return style
    }
})
