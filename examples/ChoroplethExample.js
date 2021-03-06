import React from 'react'
import { format } from 'd3'

import { ChoroplethChart } from '../src'
import { randomChoroplethData } from './data/exampleData'
import map from './data/world-110.json'

const toolTipFunction = (d) => {
  var toolTip =
    '<span class="title">' + d.x + '</span>' +
    format(',')(d.y)
  return toolTip
}

class ChoroplethExample extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      randomData: randomChoroplethData()
    }

    map.objects.countries.geometries.forEach((d, i) => {
      if (d.id === 'ATA') {
        map.objects.countries.geometries.splice(i, 1)
      }
    })
  }
  componentDidMount () {
    this.createRandomData = () => {
      setTimeout(() => {
        if (this.createRandomData !== null) {
          this.setState({
            randomData: randomChoroplethData()
          }, () => {
            if (this.createRandomData !== null) {
              this.createRandomData()
            }
          })
        }
      }, 2500)
    }
    this.createRandomData()
  }

  componentWillUnmount () {
    this.createRandomData = null
  }
  render () {
    return (
      <ChoroplethChart height={600} className='ChoroplethExample'
        margin={{ top: 5, right: 5, bottom: 50, left: 50 }}
        tipFunction={toolTipFunction} data={this.state.randomData} map={map}
        valueField='y' keyField='x' selectedField='className' selectedValue='selected' />
    )
  }
}

export default ChoroplethExample
