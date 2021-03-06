"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.HybridScatterHeatmap = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _d = require("d3");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var binByNumeric = function binByNumeric(data, accessor, range, numBins) {
  var bins = [];
  var step = (range[1] - range[0]) / numBins;

  for (var i = 0; i < numBins; i++) {
    var bin = [];

    for (var j = 0; j < data.length; j++) {
      if (data[j][accessor] < range[0] + (i + 1) * step && data[j][accessor] >= range[0] + i * step) {
        bin.push(data[j]);
      }
    }

    bin.key = i * step;
    bin.step = step;
    bin.count = bin.length;
    bins.push(bin);
  }

  return bins;
}; // Using file bound let so active heatmaps persist through view changes


var heatmap;

var HybridScatterHeatmap =
/*#__PURE__*/
function (_React$Component) {
  _inherits(HybridScatterHeatmap, _React$Component);

  function HybridScatterHeatmap(props) {
    var _this;

    _classCallCheck(this, HybridScatterHeatmap);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(HybridScatterHeatmap).call(this, props)); // Set default state

    _this.state = {
      expandedSectionNumbers: [],
      // Section #s to divide at
      domainExpansionFactor: 1,
      // Factor of domain to be used
      rangeExpansionFactor: 2,
      // Factor to expand range by
      xScale: (0, _d.scaleTime)().nice(_d.timeSecond, 1),
      yScale: (0, _d.scaleLinear)(),
      scatterColorScale: (0, _d.scaleLinear)(),
      heatmapColorScale: (0, _d.scaleQuantile)() // Use this to instead of 'let heatmap' to keep active heatmaps from persisting
      // this.heatmap = undefined

    };
    _this.endTime = _this.props.startTime - _this.props.timeWindow;
    _this.createChart = _this.createChart.bind(_assertThisInitialized(_this));
    _this.updateChart = _this.updateChart.bind(_assertThisInitialized(_this));
    _this.resizeChart = _this.resizeChart.bind(_assertThisInitialized(_this));
    _this.updateScales = _this.updateScales.bind(_assertThisInitialized(_this));
    _this.updateAxes = _this.updateAxes.bind(_assertThisInitialized(_this));
    _this.updateScatter = _this.updateScatter.bind(_assertThisInitialized(_this));
    _this.updateHeatmap = _this.updateHeatmap.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(HybridScatterHeatmap, [{
    key: "createChart",
    value: function createChart() {
      var _this2 = this;

      // Get root
      var root = this.refs.root; // Create svg

      var svg = (0, _d.select)(root).append('svg'); // Create chart

      var chart = svg.append('g').attr('class', 'chart'); // Resize Chart

      this.resizeChart(); // Create title

      var header = chart.append('g').attr('class', 'header');
      header.append('text').attr('class', 'label time').text('Displaying events from ' + (0, _d.timeFormat)('%x %X')(new Date(this.endTime)) + ' to ' + (0, _d.timeFormat)('%x %X')(new Date(this.props.startTime)));
      header.append('text').attr('class', 'label reset').text('reset').on('click', function () {
        // Set heatmap data to inactive
        for (var i = 0; i < _this2.props.heatmapHorzDivisions; i++) {
          for (var j = 0; j < _this2.props.heatmapVertDivisions; j++) {
            heatmap[j][i].active = 0;
          }
        } // Remove expanded columns


        _this2.setState({
          expandedSectionNumbers: []
        }, function () {
          _this2.resizeChart();
        });
      }); // Create container for heatmap bins

      chart.append('g').attr('class', 'heatmap data'); // Create x axis

      chart.append('g').attr('class', 'x axis').append('text').attr('class', 'label').text(this.props.xLabel); // Create y axis

      chart.append('g').attr('class', 'y axis').append('text').attr('class', 'label').text(this.props.yLabel); // Create data container for scatter points

      chart.append('g').attr('class', 'scatter data'); // Create color scale for scatter

      this.state.scatterColorScale.domain(this.props.yDomain).range([this.props.minScatterColor, this.props.maxScatterColor]).interpolate(_d.interpolateHcl); // Create color scale for heatmap

      var colors = [];
      var tempColorScale = (0, _d.scaleLinear)().domain([0, this.props.numColorCat]).range([this.props.minHeatmapColor, this.props.maxHeatmapColor]);
      (0, _d.range)(this.props.numColorCat).map(function (d) {
        colors.push(tempColorScale(d));
      });
      this.state.heatmapColorScale.range(colors);
    }
  }, {
    key: "updateChart",
    value: function updateChart() {
      this.updateScales();
      this.updateAxes();
      this.updateHeatmap();
      this.updateScatter(); // console.log(this.state.xScale.domain(), this.state.xScale.range())
    }
  }, {
    key: "updateScatter",
    value: function updateScatter() {
      var _this3 = this;

      var root = this.refs.root;
      var chart = (0, _d.select)(root).select('svg').select('.chart');
      var scatterData = chart.select('.scatter.data'); // Flatten and filter heatmap

      var data = [];

      for (var i = 0; i < heatmap.length; i++) {
        for (var j = 0; j < heatmap[i].length; j++) {
          if (heatmap[i][j].active) {
            for (var k = 0; k < heatmap[i][j].length; k++) {
              data.push(heatmap[i][j][k]);
            }
          }
        }
      } // Bind subset of data for scatter


      var points = scatterData.selectAll('.point').data(data, function (d, i) {
        return d[_this3.props.idAccessor];
      }); // Exit

      points.exit().remove(); // Enter + Update

      points.enter().append('circle').attr('class', 'point').attr('r', 4).attr('cy', function (d) {
        return _this3.state.yScale(d[_this3.props.yAccessor]);
      }).attr('cx', function (d) {
        return _this3.state.xScale(d[_this3.props.xAccessor]);
      }).style('fill', function (d, i) {
        return _this3.state.scatterColorScale(d[_this3.props.yAccessor]);
      }).on('click.scatter.' + this.props.clsName, function (d, i) {
        return _this3.props.scatterOnClick(d, i);
      }).on('mouseover.scatter.' + this.props.clsName, function (d, i) {
        return _this3.props.scatterOnMouseOver(d, i);
      }).on('mouseout.scatter.' + this.props.clsName, function (d, i) {
        return _this3.props.scatterOnMouseOut(d, i);
      }).merge(points).transition().duration(100).ease(_d.easeLinear).style('fill', function (d, i) {
        return _this3.state.scatterColorScale(d[_this3.props.yAccessor]);
      }).attr('cx', function (d) {
        return _this3.state.xScale(d[_this3.props.xAccessor]);
      });
    }
  }, {
    key: "updateHeatmap",
    value: function updateHeatmap() {
      var _this4 = this;

      var root = this.refs.root;
      var chart = (0, _d.select)(root).select('svg').select('.chart');
      var heatmapData = chart.select('.heatmap.data'); // Rebin heatmap

      var tempHeatmap = binByNumeric(this.props.data, 'score', [0, 6], this.props.heatmapVertDivisions).reverse();

      for (var i = 0; i < tempHeatmap.length; i++) {
        var d = tempHeatmap[i];
        tempHeatmap[i] = binByNumeric(d, 'time', [this.endTime, this.props.startTime], this.props.heatmapHorzDivisions);

        for (var j = 0; j < tempHeatmap[i].length; j++) {
          tempHeatmap[i][j].rowIndex = i;
          tempHeatmap[i][j].yKey = d.key;
          tempHeatmap[i][j].yStep = d.step;
          tempHeatmap[i][j].active = typeof heatmap === 'undefined' ? false : heatmap[i][j].active;
        }

        tempHeatmap[i].key = d.key;
        tempHeatmap[i].step = d.step;
        tempHeatmap[i].count = d.count;
      }

      heatmap = tempHeatmap; // Helper function to obtain the height of a single bin

      var binHeight = function binHeight(d) {
        var low = _this4.state.yScale(d.yKey);

        var high = _this4.state.yScale(d.yKey - d.yStep);

        return high - low >= 0 ? high - low : _this4.state.yScale(_this4.props.yDomain[1] - d.yStep);
      };

      var binWidth = function binWidth(d) {
        // Keep in sync by using already defined endTime above
        // console.log(this.endTime, d.key, d.step)
        var low = _this4.state.xScale(_this4.endTime + d.key);

        var high = _this4.state.xScale(_this4.endTime + d.key + d.step);

        return high - low;
      }; // Bind subset of data for heatmap


      var rows = heatmapData.selectAll('.row').data(heatmap, function (d, i) {
        return i;
      }); // Exit rows

      rows.exit().remove(); // Enter + Update rows

      rows = rows.enter().append('g').attr('class', 'row').merge(rows).attr('transform', function (d, i) {
        var x = 0;

        var y = _this4.state.yScale(d.key + d.step);

        return 'translate(' + x + ',' + y + ')';
      }); // Bind Bins

      var bins = rows.selectAll('.bin').data(function (d) {
        return d;
      }, function (d, i) {
        return i;
      }); // Exit Bins

      bins.exit().remove(); // Enter + Update Bins

      bins.enter().append('rect').attr('class', 'bin').on('click.heatmap.' + this.props.clsName, function (d, i) {
        // Need to have reference to dynamic scope for access to d3 element, so no es6
        this.props.heatmapOnClick(d, i);
        heatmap[d.rowIndex][i].active = 1 - heatmap[d.rowIndex][i].active;
        this.updateChart();
      }).on('mouseover.heatmap.' + this.props.clsName, function (d, i) {
        return _this4.props.heatmapOnMouseOver(d, i);
      }).on('mouseout.heatmap.' + this.props.clsName, function (d, i) {
        return _this4.props.heatmapOnMouseOut(d, i);
      }).merge(bins).transition().duration(400).ease(_d.easeLinear).attr('opacity', function (d, i) {
        return heatmap[d.rowIndex][i].active ? 0 : 1;
      }).attr('x', function (d) {
        return _this4.state.xScale(_this4.endTime + d.key);
      }).attr('y', 0).attr('width', function (d) {
        return binWidth(d);
      }).attr('height', function (d) {
        return binHeight(d);
      }).attr('fill', function (d) {
        var color = d.count ? _this4.state.heatmapColorScale(d.count) : _this4.props.minHeatmapColor;
        return color;
      });
      var heatmapHeightBand = (this.props.height - this.props.margin.top - this.props.margin.bottom) / this.props.heatmapVertDivisions; // Create clickable markers to expand entire column

      var columnMarkers = heatmapData.selectAll('.markerCol').data(heatmap[0], function (d, i) {
        return i;
      });
      columnMarkers.enter().append('rect').attr('class', 'markerCol').on('click.markerCol', function (d, i) {
        // Normal click: toggle expansion and activity
        // Shift click: just toggle expansion
        // Alt click: just toggle activity
        if (event.altKey || !event.shiftKey) {
          // Iterate over the columns corresponding bins and flip their activity
          for (var row = 0; row < _this4.props.heatmapVertDivisions; row++) {
            heatmap[row][i].active = 1 - heatmap[row][i].active;
          }

          _this4.updateChart();
        }

        if (event.shiftKey || !event.altKey) {
          var index = _this4.state.expandedSectionNumbers.indexOf(i);

          var toExpand = null;

          if (index > -1) {
            toExpand = _this4.state.expandedSectionNumbers;
            toExpand.splice(index, 1);
          } else {
            var chartWidth = root.offsetWidth - _this4.props.margin.left - _this4.props.margin.right;
            var originalBlockSize = chartWidth * (1 / _this4.props.heatmapHorzDivisions);
            var expandedBlockSize = originalBlockSize * _this4.state.rangeExpansionFactor;
            var pending = (_this4.state.expandedSectionNumbers.length + 1) * expandedBlockSize;

            if (pending >= chartWidth || _this4.state.expandedSectionNumbers.length + 1 === _this4.props.heatmapHorzDivisions) {
              toExpand = _this4.state.expandedSectionNumbers;
            } else {
              toExpand = _this4.state.expandedSectionNumbers.concat(i).sort(function (a, b) {
                return a - b;
              });
            }
          }

          _this4.setState({
            expandedSectionNumbers: toExpand
          }, function () {
            _this4.resizeChart();
          });
        }
      }).merge(columnMarkers).transition().duration(400).ease(_d.easeLinear).attr('x', function (d, i) {
        return _this4.state.xScale(_this4.endTime + d.key);
      }).attr('y', function (d, i) {
        return -(heatmapHeightBand / 4) - 3;
      }).attr('fill', function (d, i) {
        var count = 0;

        for (var row = 0; row < _this4.props.heatmapVertDivisions; row++) {
          count += heatmap[row][i].count;
        }

        var color = _this4.state.heatmapColorScale(count);

        return color;
      }).attr('width', function (d) {
        return binWidth(d);
      }).attr('height', function () {
        return heatmapHeightBand / 4;
      });
    }
  }, {
    key: "updateScales",
    value: function updateScales() {
      var props = this.props;
      var originalTimeSlice = this.props.timeWindow / this.props.heatmapHorzDivisions;
      var expandedTimeSlice = originalTimeSlice * this.state.domainExpansionFactor; // Compute new end time

      var timeWindow = 0;

      for (var i = 0; i < this.props.heatmapHorzDivisions; i++) {
        if (this.state.expandedSectionNumbers.indexOf(i) > -1) {
          timeWindow += expandedTimeSlice;
        } else {
          timeWindow += originalTimeSlice;
        }
      } // console.log(timeWindow / 1000, originalTimeSlice, expandedTimeSlice)


      this.endTime = this.props.startTime - timeWindow;
      var xDomain = [this.endTime];

      for (var _i = 0; _i < this.props.heatmapHorzDivisions - 1; _i++) {
        var previous = xDomain[xDomain.length - 1];

        if (this.state.expandedSectionNumbers.indexOf(_i) > -1) {
          xDomain.push(previous + expandedTimeSlice);
        } else {
          xDomain.push(previous + originalTimeSlice);
        }
      }

      xDomain.push(this.props.startTime); // Update window of time x scale

      this.state.xScale.domain(xDomain); // Update y scale domain

      this.state.yScale.domain(props.yDomain); // Update scatter color scale

      this.state.scatterColorScale.domain(props.yDomain); // Update heatmap color scale

      var colorDomain = [0, 1];

      if (typeof heatmap !== 'undefined' && heatmap) {
        for (var _i2 = 0; _i2 < heatmap.length; _i2++) {
          for (var j = 0; j < heatmap[_i2].length; j++) {
            colorDomain.push(heatmap[_i2][j].count);
          }
        }
      }

      this.state.heatmapColorScale.domain(colorDomain);
    }
  }, {
    key: "updateAxes",
    value: function updateAxes() {
      var root = this.refs.root;
      var svg = (0, _d.select)(root).select('svg');
      var chart = svg.select('.chart');
      chart.select('.header .time').text('Displaying events from ' + (0, _d.timeFormat)('%x %X')(new Date(this.endTime)) + ' to ' + (0, _d.timeFormat)('%x %X')(new Date(this.props.startTime)));
      chart.select('.x.axis').call((0, _d.axisBottom)().scale(this.state.xScale).ticks(5).tickFormat(function (a) {
        var format = (0, _d.timeFormat)('%I:%M:%S');
        return format(a);
      }));
      chart.select('.y.axis').call((0, _d.axisLeft)().scale(this.state.yScale));
    }
  }, {
    key: "resizeChart",
    value: function resizeChart() {
      var root = this.refs.root;
      var svg = (0, _d.select)(root).select('svg');
      var chart = svg.select('.chart');
      var chartWidth = root.offsetWidth - this.props.margin.left - this.props.margin.right;
      var chartHeight = this.props.height - this.props.margin.top - this.props.margin.bottom; // Check edge cases to find where to place mid points

      var originalBlockSize = chartWidth * (1 / this.props.heatmapHorzDivisions);
      var expandedBlockSize = originalBlockSize * this.state.rangeExpansionFactor;
      var newBlockSize = (chartWidth - this.state.expandedSectionNumbers.length * expandedBlockSize) / (this.props.heatmapHorzDivisions - this.state.expandedSectionNumbers.length);
      var xRange = [0];

      for (var i = 0; i < this.props.heatmapHorzDivisions - 1; i++) {
        var previous = xRange[xRange.length - 1];

        if (this.state.expandedSectionNumbers.indexOf(i) > -1) {
          xRange.push(previous + expandedBlockSize);
        } else {
          xRange.push(previous + newBlockSize);
        }
      }

      xRange.push(chartWidth);
      this.state.xScale.range(xRange);
      this.state.yScale.range([chartHeight, 0]);
      chart.attr('transform', 'translate(' + this.props.margin.left + ',' + this.props.margin.top + ')');
      chart.select('.header .time').attr('y', -this.props.margin.top + 1).attr('dy', '0.71em').style('text-anchor', 'start');
      chart.select('.header .reset').attr('x', chartWidth).attr('y', -this.props.margin.top + 1).attr('dy', '0.71em').style('text-anchor', 'end');
      chart.select('.x.axis').attr('transform', 'translate(0,' + chartHeight + ')').call((0, _d.axisBottom)().scale(this.state.xScale)).select('.label').attr('x', chartWidth).attr('y', -6);
      chart.select('.y.axis').call((0, _d.axisLeft)().scale(this.state.yScale)).select('.label').attr('transform', 'rotate(-90)').attr('y', 6).attr('dy', '.35em');
      svg.attr('width', chartWidth + this.props.margin.left + this.props.margin.right).attr('height', chartHeight + this.props.margin.top + this.props.margin.bottom);
      this.updateChart();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var root = this.refs.root;
      (0, _d.select)(root).selectAll('*').remove();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.createChart();
      this.resizeChart();
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate() {
      this.updateChart();
      return false;
    }
  }, {
    key: "render",
    value: function render() {
      return _react["default"].createElement("div", {
        ref: "root",
        className: this.props.clsName
      });
    }
  }]);

  return HybridScatterHeatmap;
}(_react["default"].Component);

exports.HybridScatterHeatmap = HybridScatterHeatmap;
HybridScatterHeatmap.propTypes = {
  clsName: _propTypes["default"].string.isRequired,
  margin: _propTypes["default"].object,
  height: _propTypes["default"].number,
  xLabel: _propTypes["default"].string,
  yLabel: _propTypes["default"].string,
  scatterOnClick: _propTypes["default"].func,
  scatterOnMouseOver: _propTypes["default"].func,
  scatterOnMouseOut: _propTypes["default"].func,
  heatmapOnClick: _propTypes["default"].func,
  heatmapOnMouseOver: _propTypes["default"].func,
  heatmapOnMouseOut: _propTypes["default"].func,
  idAccessor: _propTypes["default"].string,
  xAccessor: _propTypes["default"].string.isRequired,
  yAccessor: _propTypes["default"].string.isRequired,
  minScatterColor: _propTypes["default"].any,
  maxScatterColor: _propTypes["default"].any,
  minHeatmapColor: _propTypes["default"].any,
  maxHeatmapColor: _propTypes["default"].any,
  numColorCat: _propTypes["default"].number,
  yDomain: _propTypes["default"].array.isRequired,
  data: _propTypes["default"].array,
  startTime: _propTypes["default"].number,
  timeWindow: _propTypes["default"].number,
  heatmapVertDivisions: _propTypes["default"].number,
  heatmapHorzDivisions: _propTypes["default"].number // Set default props

};
HybridScatterHeatmap.defaultProps = {
  startTime: +new Date(),
  timeWindow: 20 * 1000,
  heatmapVertDivisions: 4,
  heatmapHorzDivisions: 4,
  minHeatmapColor: '#eff3ff',
  maxHeatmapColor: '#2171b5',
  numColorCat: 11,
  minScatterColor: '#F1F5E9',
  maxScatterColor: '#7C9B27',
  margin: {
    top: 30,
    right: 5,
    bottom: 20,
    left: 50
  },
  height: 250,
  idAccessor: 'uuid',
  xLabel: 'x',
  yLabel: 'y',
  scatterOnClick: function scatterOnClick() {},
  scatterOnMouseOver: function scatterOnMouseOver() {},
  scatterOnMouseOut: function scatterOnMouseOut() {},
  heatmapOnClick: function heatmapOnClick() {},
  heatmapOnMouseOver: function heatmapOnMouseOver() {},
  heatmapOnMouseOut: function heatmapOnMouseOut() {}
};
var _default = HybridScatterHeatmap;
exports["default"] = _default;