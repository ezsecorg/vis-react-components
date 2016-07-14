const functor = (f) => {
  return typeof f === 'function'
    ? f()
    : f
}

const getWidth = () => {
  if (self.innerHeight) {
    return self.innerWidth
  }

  if (document.documentElement && document.documentElement.clientWidth) {
    return document.documentElement.clientWidth
  }

  if (document.body) {
    return document.body.clientWidth
  }
}

export default class Tooltip {
  constructor () {
    // Init tooltip
    this.tooltip = document.createElement('div')
    this.tooltip.style.display = 'none'
    this.tooltip.style.position = 'absolute'
    this.tooltip.style['box-sizing'] = 'border-box'
    document.body.appendChild(this.tooltip)

    // Set up defaults
    this._html = ''
    this._baseClass = ''
    this._offset = [0, 0]
    this._direction = 'n'
    this._autoDirection = true
  }

  destroy () {
    document.body.removeChild(this.tooltip)
  }

  show (event, data) {
    this.tooltip.className = this._baseClass
    this.tooltip.innerHTML = this._html(data)
    this.tooltip.style.display = 'block'
    let bbox = this.getScreenBBox(event)
    let direction = this._direction
    let coords = {}
    coords.top = bbox[direction].y
    coords.left = bbox[direction].x
    if (this._autoDirection) {
      direction = this.getAutoDirection(bbox, direction, coords)
    }
    this.tooltip.classList.add(direction)
    this.tooltip.style.top = (coords.top + this._offset[0]) + document.body.scrollTop + 'px'
    this.tooltip.style.left = (coords.left + this._offset[1]) + document.body.scrollLeft + 'px'
    return this
  }

  hide () {
    this.tooltip.style.display = 'none'
    return this
  }

  html (tooltipFunction) {
    if (!arguments.length) return this._html
    this._html = tooltipFunction

    return this
  }

  direction (d) {
    if (!arguments.length) return this._direction
    this._direction = functor(d)

    return this
  }

  autoDirection (v) {
    if (!arguments.length) return this._autoDirection
    this._autoDirection = v

    return this
  }

  offset (o) {
    if (!arguments.length) return this._offset
    this._offset = functor(o)

    return this
  }

  attr (attr, value) {
    if (arguments.length < 2 && typeof attr === 'string') {
      return this.tooltip.getAttribute('string')
    } else {
      this.tooltip[attr] = functor(value)
      if (attr === 'className') {
        this._baseClass = this.tooltip[attr]
      }
    }
    return this
  }

  style (styl, value) {
    if (arguments.length < 2 && typeof attr === 'string') {
      return this.tooltip.getAttribute('string')
    } else {
      this.tooltip[styl] = functor(value)
    }

    return this
  }

  // NOTE: Currently assumes a default direction of 'N'
  // Mutates coords and return corrected direction
  getAutoDirection (bbox, direction, coords) {
    if (coords.left < 0) {
      coords.left = bbox.e.x
      coords.top = bbox.e.y
      return 'e'
    } else if (coords.left + this.tooltip.offsetWidth > getWidth()) {
      coords.left = bbox.w.x
      coords.top = bbox.w.y
      return 'w'
    } else {
      return 'n'
    }
  }

  getScreenBBox (event = null) {
    if (event === null) {
      return null
    }

    let target = event.target
    let bbox = {}
    let point = target.ownerSVGElement.createSVGPoint()
    let matrix = target.getScreenCTM()
    let tbbox = target.getBBox()
    let width = tbbox.width
    let height = tbbox.height
    let x = tbbox.x
    let y = tbbox.y

    point.x = x
    point.y = y

    bbox.nw = point.matrixTransform(matrix)
    bbox.nw.y -= this.tooltip.offsetHeight
    bbox.nw.x -= this.tooltip.offsetWidth
    point.x += width

    bbox.ne = point.matrixTransform(matrix)
    bbox.ne.y -= this.tooltip.offsetHeight
    point.y += height

    bbox.se = point.matrixTransform(matrix)
    point.x -= width

    bbox.sw = point.matrixTransform(matrix)
    bbox.sw.x -= this.tooltip.offsetWidth
    point.y -= height / 2

    bbox.w = point.matrixTransform(matrix)
    bbox.w.y -= this.tooltip.offsetHeight / 2
    bbox.w.x -= this.tooltip.offsetWidth
    point.x += width

    bbox.e = point.matrixTransform(matrix)
    bbox.e.y -= this.tooltip.offsetHeight / 2
    point.x -= width / 2
    point.y -= height / 2

    bbox.n = point.matrixTransform(matrix)
    bbox.n.x -= this.tooltip.offsetWidth / 2
    bbox.n.y -= this.tooltip.offsetHeight
    point.y += height

    bbox.s = point.matrixTransform(matrix)
    bbox.s.x -= this.tooltip.offsetWidth / 2

    return bbox
  }
}
