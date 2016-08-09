import React, { PropTypes } from 'react'
import ReactDom from 'react-dom'
import { axisLeft, axisRight, axisTop, axisBottom, select } from 'd3'

// Truncate labels based on maximum allowable characters, where
  // characters should be estimated at 8-10 pixels per character.
const truncateLabel = (d, maxChars) => {
  let replacementString = '...'
  if (d.length > maxChars + replacementString.length) {
    return d.substring(0, maxChars) + '...'
  }
  return d
}
class Axis extends React.Component {
  constructor (props) {
    super(props)
    this.state = {range: 0, ticks: 0}

    this.setAxis = this.setAxis.bind(this)
    this.resizeAxis = this.resizeAxis.bind(this)

    this.axis = null
    this.setAxis(this.props)
  }

  componentDidMount () {
    this.resizeAxis()
  }

  componentDidUpdate () {
    // console.log(this.props.type + ' did update')
    this.resizeAxis()
  }

  componentWillReceiveProps (nextProps) {
    // console.log(this.props.type + ' will receive props')
    let range = nextProps.scale.range()[1] - nextProps.scale.range()[0]
    this.setState({range})
  }

  setAxis (props) {
    if (props.orient === 'left') {
      this.axis = axisLeft()
    } else if (props.orient === 'bottom') {
      this.axis = axisBottom()
    } else if (props.orient === 'top') {
      this.axis = axisTop()
    } else if (props.orient === 'right') {
      this.axis = axisRight()
    }
    this.axis.scale(props.scale)
  }
  // Re-calculate postions of the chart based on the currently rendered position
  // Also updates the axes based on the
  resizeAxis () {
    let props = this.props
    let thisNode = ReactDom.findDOMNode(this)
    let parentNode = thisNode.parentNode
    let selector = '.' + props.className.replace(/ /g, '.')
    let selection = select(parentNode).select(selector)

    let tickCount = 0
    let tickValues = props.tickValues
    let tickFormatter = null

    if (props.scale.domain().length > 0 && props.scale.range().length > 0) {
      // Use custom tick count if it exist
      if (props.tickCount) {
        tickCount = props.tickCount
      } else {
        tickCount = props.type === 'y' ? 3 : props.scale.domain().length
      }

      // If scale type is ordinal truncate labels
      if (/ordinal/.test(props.scale.type)) {
        let maxWidth = 0
        let fontSize = 12
        if (props.orient === 'top' || props.orient === 'bottom') {
          let binWidth = Math.floor((props.scale.step()))
          maxWidth = Math.floor(binWidth / fontSize)
        } else {
          if (props.orient === 'left') {
            maxWidth = props.margin.left
          } else {
            maxWidth = props.margin.right
          }
        }
        tickFormatter = (d) => {
          return truncateLabel(d, maxWidth)
        }
      }

      // Use custom tickFormatter if it exist
      if (props.tickFormat) {
        tickFormatter = (d, i) => {
          return props.tickFormat(d, i)
        }
      }
    }
    // Commenting this out doesn't appear to cause any problems
    // it also seems to improve the re-rendering performance a bit.
    // this.setAxis(props)
    this.axis
      .tickFormat(tickFormatter)
      .tickValues(tickValues)
      .ticks(tickCount)
    selection.call(this.axis)

    // NOTE: Use of a custom tick style requires custom tickValues
    // This is so meaningful data gets passed instead of truncated garbage
    if (props.tickStyle && tickValues) {
      selection.selectAll('.tick text')
        .each(function (d, i) {
          let tick = select(this)
          // console.log(this.axis.tickValues(), i)
          props.tickStyle(tick, tickValues[i], i)
        })
    }
  }

  render () {
    let props = this.props
    // Need to handle top and left orientations, but this works for now
    let transform = ''
    if (props.orient === 'bottom') {
      transform = 'translate(0,' + props.chartHeight + ')'
    } else if (props.orient === 'right') {
      transform = 'translate(' + props.chartWidth + ',0)'
    }
    if (props.label) {
      return (
        <g className={props.className} transform={transform}>
          <text className='label'>{props.label}</text>
        </g>
      )
    } else {
      return <g className={props.className} transform={transform}></g>
    }
  }
}

Axis.defaultProps = {
  type: 'x',
  orient: 'left',
  tickValues: null,
  tickCount: null,
  tickFormat: null,
  tickStyle: null,
  label: ''
}

Axis.propTypes = {
  orient: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  tickStyle: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.bool
  ]),
  tickValues: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.bool
  ]),
  tickCount: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.bool
  ]),
  tickFormat: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.bool
  ]),
  label: PropTypes.string,
  scale: PropTypes.any
}
export default Axis
