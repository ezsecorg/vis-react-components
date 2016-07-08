'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _TextBar = require('./TextBar');

var _TextBar2 = _interopRequireDefault(_TextBar);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _stories = require('../examples/data/for-hci/stories.json');

var _stories2 = _interopRequireDefault(_stories);

var _enduringTopicsListed = require('../examples/data/for-hci/enduring-topics-listed.json');

var _enduringTopicsListed2 = _interopRequireDefault(_enduringTopicsListed);

var _hourlyTopicsListed = require('../examples/data/for-hci/hourly-topics-listed.json');

var _hourlyTopicsListed2 = _interopRequireDefault(_hourlyTopicsListed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// import Bar from './Bar'


/* const lineMaker = d3.svg.line()
  .x((d) => {
    return d.x
  })
  .y((d) => {
    return d.y
  }) */

var diagMaker = _d2.default.svg.diagonal().source(function (d) {
  return { 'x': d[0].y, 'y': d[0].x };
}).target(function (d) {
  return { 'x': d[1].y, 'y': d[1].x };
}).projection(function (d) {
  return [d.y, d.x];
});

var StoryViewer = function (_React$Component) {
  _inherits(StoryViewer, _React$Component);

  _createClass(StoryViewer, [{
    key: '_onEnter',

    // grabbing onEnter and Leave functions from chart and making new set of rules
    value: function _onEnter(toolTipData, svgElement) {
      var props = this.props;
      props.onEnter(toolTipData, svgElement);
      // this.setState({selectedTopics: toolTipData.label})
    }
  }, {
    key: '_onLeave',
    value: function _onLeave(toolTipData, svgElement) {
      var props = this.props;
      props.onLeave(toolTipData, svgElement);
      // this.setState({selectedTopics: []})
    }
  }, {
    key: '_onClick',
    value: function _onClick(tooltipData) {
      var _this2 = this;

      // resetting topic info
      var newID = [[], [], []];
      var dataInd = tooltipData.dataInd;
      var index = tooltipData.index;
      // getting topic information for clicked topic

      newID[dataInd] = this.currData[dataInd][index];
      // getting topic information of related topics
      this.barData[dataInd][index].story.map(function (sData) {
        newID[sData.dataInd] = _this2.currData[sData.dataInd][sData.index];
      });
      // re-render with new topic info
      this.setState({ currentID: newID });
    }
  }, {
    key: '_onMoveClick',
    value: function _onMoveClick(tooltipData) {
      //  console.log('moveClick', tooltipData)
      var sIndex = 0;
      if (tooltipData.label === 'back') {
        if (this.state.storyInd !== 0) {
          sIndex = this.state.storyInd - 1;
        } else {
          sIndex = _stories2.default.length - 1;
        }
      } else if (tooltipData.label === 'forward') {
        if (this.state.storyInd !== _stories2.default.length - 1) {
          sIndex = this.state.storyInd + 1;
        } else {
          sIndex = 0;
        }
      }
      this.initTopics(this.props, sIndex);
      this.setState({ storyInd: sIndex, currentID: [[], [], []] });
    }
  }]);

  function StoryViewer(props) {
    _classCallCheck(this, StoryViewer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StoryViewer).call(this, props));

    _this.state = {
      dataUp: 0,
      storyInd: 0,
      currentID: [[], [], []],
      selectedTopics: []
    };
    _this.onEnter = _this._onEnter.bind(_this);
    _this.onLeave = _this._onLeave.bind(_this);
    _this.onClick = _this._onClick.bind(_this);
    _this.onMoveClick = _this._onMoveClick.bind(_this);
    // might not need pref scale if not coloring bars
    _this.prefScale = _d2.default.scale.category20();
    _this.lineData = [];
    _this.barData = [];
    _this.tType = ['hour-Curr-', 'enduring-Curr-', 'enduring-Prev-'];
    _this.currStory = [];
    _this.currData = [];
    return _this;
  }

  _createClass(StoryViewer, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (this.props.data.length <= 0) {
        console.log('SVprobNoDataWillRProps');
        this.setState({ dataUp: 1 });
      }
      return true;
      // return nextProps.data.length !== this.props.data.length || nextProps.loading !== this.props.loading
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps, nextState) {
      if (nextState.storyInd !== this.state.storyInd) {
        console.log('letting you know');
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var xDomain = [0, 1, 2, 3];
      this.props.xScale.domain(xDomain);
      this.props.yScale.domain([nextProps.maxTopics + 2, 0.00001]);
      this.statArr = new Array(nextProps.data.length);
      for (var i = 0; i < nextProps.data.length; i++) {
        this.statArr[i] = new Array(nextProps.data[i].length);
      }
      this.prefScale.domain(nextProps.colorDomain);
      this.initTopics(nextProps, 0);
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {}
    // console.log('willMountChartHeight', this.props.chartHeight)

    // React LifeCycle method - called after initial render

  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {}
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {}
  }, {
    key: 'buildABar',
    value: function buildABar(bin, name, text, height, width, x, y, barStyle, txtStyle) {
      return {
        className: name,
        text: text,
        height: height,
        data: bin,
        width: width,
        rx: height / 4,
        ry: height / 4,
        x: x,
        y: y,
        barStyle: barStyle,
        textStyle: txtStyle
      };
    }
  }, {
    key: 'buildAText',
    value: function buildAText(fontSize, color) {
      return {
        textAnchor: 'start',
        fontSize: fontSize,
        width: '10px'
      };
    }
  }, {
    key: 'trimText',
    value: function trimText(text, width, fontSize) {
      var ell = '...';
      var buff = 1.5;
      text.toString();
      // console.log('textLength', text.length)
      // 12 is the supposed font size of the text
      if (text.length > width / fontSize * buff) {
        return text.slice(0, width / fontSize * buff - ell.length) + ell;
        // return text.substring(0, width / 12 - ell.length * buff) + ell
      }
      return text;
    }
  }, {
    key: 'initTopics',
    value: function initTopics(props, storyInd) {
      var _this3 = this;

      var paddedWidth = props.chartWidth * (1 - props.padding).toFixed(2);
      var barWidth = Math.ceil(paddedWidth / (4 + props.outerPadding * 2));
      var barHeight = 10;
      // let lineData = []
      // console.log('storyData0', storyData[0])
      // setting current story
      this.currStory = _stories2.default[storyInd];
      props.xScale.rangeRoundBands([0, props.chartWidth], props.padding, props.outerPadding);
      var timeStepBars = [];
      console.log('zero', props.xScale(0));
      // setting up data for (ex: hr[01], end[01]. end[00])
      this.currData[0] = _hourlyTopicsListed2.default[storyInd + 1];
      this.currData[1] = _enduringTopicsListed2.default[storyInd + 1];
      this.currData[2] = _enduringTopicsListed2.default[storyInd + 0];
      // cycling through data for particular story index

      var _loop = function _loop(k) {
        // making bar data for each data set
        var currBars = Object.keys(_this3.currData[k]).map(function (i) {
          var data = _this3.currData[k][i];
          if (data[0] == null) {
            data[0] = 'EMPTY';
          }
          var posY = _this3.props.chartHeight / Object.keys(_this3.currData[k]).length * i;
          var posX = props.xScale(k);
          var fontSize = 12;
          var cName = _this3.tType[k] + (storyInd + 1).toString() + '-index-' + i;
          // let topicColor = {stroke: this.prefScale(data[0].split(/:|-/, 1)[0])}
          var topicColor = { stroke: 'black' };
          if (k === 0) {
            topicColor = { stroke: 'green' };
          } else if (k === 2) {
            topicColor = { stroke: 'purple' };
          }
          // console.log('tColor', topicColor)
          var text = _this3.trimText(data[0], barWidth, fontSize);
          var barTxtStyle = _this3.buildAText(fontSize.toString() + 'px', 'black');
          var bar = _this3.buildABar(data, cName, text, barHeight, barWidth, posX, posY, topicColor, barTxtStyle);
          // console.log('bData', bar)
          bar.tooltipData = { label: cName, counts: bar.data.length, dataInd: k, index: i };
          return bar;
        });
        // adding bar data to all bar data
        timeStepBars.push(currBars);
      };

      for (var k = 0; k < 3; k++) {
        _loop(k);
      }
      // dataMatch = [{x: posX + barWidth, y: posY + barHeight / 2}, {x: props.xScale(index + 1), y: this.props.yScale(k) + barHeight / 2}]
      this.barData = timeStepBars;
      var midBar = barHeight / 2;
      // console.log('keys', Object.keys(currStory))
      var lineData = Object.keys(this.currStory).map(function (i) {
        var data = _this3.currStory[i];
        var endCurr = timeStepBars[1][i];
        endCurr.story = [];
        var matchBar = [];
        return data.map(function (arr, index) {
          var dataMatch = [];
          if (arr[0] === 0) {
            // enduring (n-1)
            endCurr.story.push({ dataInd: 2, index: arr[1] });
            endCurr.barStyle.stroke = 'purple';
            matchBar = timeStepBars[2][arr[1]];
            dataMatch = [{ x: endCurr.x + barWidth, y: endCurr.y + midBar }, { x: matchBar.x, y: matchBar.y + midBar }];
          } else if (arr[0] === 1) {
            // hr (n)
            endCurr.story.push({ dataInd: 0, index: arr[1] });
            endCurr.barStyle.stroke = 'green';
            matchBar = timeStepBars[0][arr[1]];
            dataMatch = [{ x: endCurr.x, y: endCurr.y + midBar }, { x: matchBar.x + barWidth, y: matchBar.y + midBar }];
          }
          matchBar.story = [{ dataInd: 1, index: parseFloat(i) }];
          if (index !== 0) {
            endCurr.barStyle.stroke = 'black';
            var story = endCurr.story;
            timeStepBars[story[0].dataInd][story[0].index].story.push(story[1]);
            matchBar.story.push(story[0]);
          }
          return diagMaker(dataMatch);
        });
      });
      this.lineData = lineData;
      // setting up time moving
      var moveLabels = ['back', 'forward'];
      var moveFontS = 20;
      var moveBH = moveFontS + 10;
      var moveStart = props.xScale(0) / 8;
      var moveBW = (props.xScale(0) - moveStart) / 3;
      var moveButt = moveLabels.map(function (label, i) {
        var data = label;
        var posY = 20;
        var posX = moveStart + i * (moveBW + 20);
        var cName = label;
        var color = { fill: 'grey', stroke: 'black' };
        // console.log('tColor', topicColor)
        var text = '';
        if (label === 'forward') {
          text = '>';
        } else {
          text = '<';
        }
        var barTxtStyle = _this3.buildAText(moveFontS.toString() + 'px', 'black');
        var bar = _this3.buildABar(data, cName, text, moveBH, moveBW, posX, posY, color, barTxtStyle);
        // console.log('bData', bar)
        bar.tooltipData = { label: cName, counts: 0 };
        return _react2.default.createElement(_TextBar2.default, _extends({ key: 'move' + label }, bar, { onClick: _this3.onMoveClick }));
      });
      this.moveBars = _react2.default.createElement(
        'g',
        { key: 'movers' },
        moveButt,
        _react2.default.createElement(
          'text',
          { fontSize: moveFontS, x: moveStart, y: 90 },
          'hour' + (storyInd + 1).toString()
        )
      );
    }
  }, {
    key: 'renderTopics',
    value: function renderTopics() {
      var _this4 = this;

      // console.log('SVRenderID', this.state.currentID)
      var svgBins = this.barData.map(function (array, index) {
        return array.map(function (data, i) {
          var key = 'bar-' + i + index;
          return _react2.default.createElement(
            'g',
            { key: key },
            _react2.default.createElement(_TextBar2.default, _extends({}, data, { onEnter: _this4.onEnter, onLeave: _this4.onLeave, onClick: _this4.onClick }))
          );
        });
      });
      var svgLines = this.lineData.map(function (array, index) {
        return array.map(function (data, i) {
          var key = 'line-' + index + i;
          return _react2.default.createElement(
            'g',
            { key: key },
            _react2.default.createElement('path', { className: ' lineMatch -' + index + i, d: array, style: { stroke: 'grey' } })
          );
        });
      });
      var svgInfo = [];

      var _loop2 = function _loop2(i) {
        var startPos = 100 + (_this4.props.chartHeight - 100) / 3 * i;
        var type = _this4.tType[i].toString().split(/-/, 1);
        if (i === 0 || i === 1) {
          type = type + (_this4.state.storyInd + 1).toString() + ': ';
        } else {
          type = type + _this4.state.storyInd.toString() + ': ';
        }
        var info = _this4.state.currentID[i].map(function (data, index) {
          return _react2.default.createElement(
            'text',
            { key: _this4.tType[i] + 'info-' + index, fontSize: '14px', x: _this4.props.xScale(3) - _this4.props.xScale(0) / 2 + 10, y: startPos + 20 + index * 16 },
            data
          );
        });
        svgInfo[i] = _react2.default.createElement(
          'g',
          { key: 'view' + i },
          _react2.default.createElement(
            'text',
            { fontSize: '20px', x: _this4.props.xScale(3) - _this4.props.xScale(0) / 2, y: startPos, style: { fontWeight: 'bold', textDecoration: 'underline' } },
            type
          ),
          info
        );
      };

      for (var i = 0; i < 3; i++) {
        _loop2(i);
      }
      // {svgLines}
      // {svgInfo}
      return _react2.default.createElement(
        'g',
        { className: 'bin' },
        this.moveBars,
        svgLines,
        svgBins,
        svgInfo
      );
    }

    // gives text if loading data

  }, {
    key: 'renderLoadAnimation',
    value: function renderLoadAnimation(props) {
      var chartWidth = props.chartWidth;
      var chartHeight = props.chartHeight;

      var xPos = Math.floor(chartWidth / 2);
      var yPos = Math.floor(chartHeight / 2);
      var messageText = 'Loading data...';
      if (!props.loading) {
        if (props.status === 'Failed to fetch') {
          messageText = 'Can\'t connect to API URL';
        } else if (props.status !== 'OK') {
          messageText = 'Error retrieving data: ' + props.status;
        } else {
          messageText = 'No data returned!';
        }
      }
      return _react2.default.createElement(
        'g',
        { className: 'loading-message' },
        _react2.default.createElement(
          'text',
          { x: xPos, y: yPos },
          messageText
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var renderEl = null;
      if (this.props.data.length <= 0) {
        console.log('probably no data');
        renderEl = this.renderLoadAnimation(this.props);
      } else {
        renderEl = this.renderTopics();
      }
      return renderEl;
    }
  }]);

  return StoryViewer;
}(_react2.default.Component);

StoryViewer.defaultProps = {
  data: [],
  padding: 0.4,
  outerPadding: 0.4,
  chartHeight: 0,
  chartWidth: 0,
  barHeight: 20,
  maxTopics: 60,
  lineType: 'curved'
};

StoryViewer.propTypes = {
  className: _react.PropTypes.string.isRequired,
  loading: _react.PropTypes.bool,
  padding: _react.PropTypes.number.isRequired,
  outerPadding: _react.PropTypes.number.isRequired,
  xScale: _react.PropTypes.any,
  yScale: _react.PropTypes.any,
  data: _react.PropTypes.any,
  status: _react.PropTypes.string,
  chartHeight: _react.PropTypes.number.isRequired,
  chartWidth: _react.PropTypes.number.isRequired,
  barHeight: _react.PropTypes.number.isRequired,
  maxTopics: _react.PropTypes.number.isRequired,
  colorDomain: _react.PropTypes.array,
  lineType: _react.PropTypes.string.isRequired
};

exports.default = StoryViewer;