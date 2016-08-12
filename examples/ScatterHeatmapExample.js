import React from 'react'
import debounce from 'lodash.debounce'

// import { HybridScatterHeatmapChart } from '../src'
import { ScatterHeatmapHybrid } from '../src'

let points = []
let now = +new Date()
for (let i = 0; i < 1000; i++) {
  let x = now + Math.sin(i) * 30 * 1000
  let y = Math.random() * 6
  points.push({
    x,
    y,
    time: x,
    score: y,
    id: i
  })
}

// Function to bin scatter points
const bin = (points, now, width = 12, height = 6) => {
  let data = []
  let endTime = now - 20 * 1000
  let slice = (now - endTime) / width
  for (let i = 1; i < height + 1; i++) {
    let datum = {}
    datum.key = i
    datum.value = 0
    datum.bins = []
    for (let j = 0; j < width; j++) {
      let key = endTime + j * slice
      let data = []
      for (let k = 0; k < points.length; k++) {
        if (points[k].x > key && points[k].x < key + slice) {
          if (points[k].y >= i - 1 && points[k].y < i) {
            data.push(points[k])
          }
        }
      }

      datum.value += data.length
      datum.bins.push({
        data: data,
        key: key,
        value: data.length
      })
    }
    data.push(datum)
  }
  return data
}

class ScatterHeatmapExample extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      now: now,
      data: bin(points, now)
    }

    this.handleResize = debounce(this.handleResize.bind(this), 500)

    this.scatterKeyFunction = (d, i) => {
      return d.id
    }
  }

  handleResize () {
    this.refs.chart.resizeChart()
    this.refs.chart.updateChart()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize, false)
    this.reBinData = null
  }

  componentDidMount () {
    window.addEventListener('resize', this.handleResize, false)

    this.reBinData = () => {
      setTimeout(() => {
        if (this.reBinData !== null) {
          let now = +new Date()
          this.setState({
            now: now,
            data: bin(points, now)
          }, () => {
            if (this.reBinData !== null) {
              this.reBinData()
            }
          })
        }
      }, 1)
    }
    this.reBinData()
  }

  render () {
    return (
      <div>
        {<ScatterHeatmapHybrid
          ref='chart'
          startTime={this.state.now}
          clsName={'ScatterHeatmapHybrid'}
          height={600}
          idAccessor={'id'}
          xAccessor={'time'}
          yAccessor={'score'}
          xLabel={'Event Time'}
          yLabel={'Score'}
          yDomain={[0, 6]}
          timeWindow={30 * 1000}
          heatmapVertDivisions={12}
          heatmapHorzDivisions={12}
          data={points} />}
        {/* <HybridScatterHeatmapChart
          className='Hybrid'
          height={600}
          startTime={this.state.now}
          timeWindow={20 * 1000}
          scatterKeyFunction={this.scatterKeyFunction}
          data={this.state.data} /> */}
      </div>

    )
  }
}

export default ScatterHeatmapExample
