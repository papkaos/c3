import CLASS from './class';
import {
  ChartInternal
} from './core';
import {
  isValue,
  isFunction,
  isArray,
  isString,
  sanitise
} from './util';

ChartInternal.prototype.initHint = function () {
  var $$ = this;
  $$.hint = $$.selectChart
    .style("position", "relative")
    .append("div")
    .attr('class', CLASS.hintContainer)
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("display", "none");
};
ChartInternal.prototype.getHintContent = function () {
  var $$ = this,
    config = $$.config,
    hintText = config.hint_text || 'Click to see details';

  return "<span class='" + CLASS.hint + "'>" + hintText + "</span>";
};
ChartInternal.prototype.hintPosition = function (dataToShow, tWidth, tHeight, element) {
  var $$ = this,
    config = $$.config,
    d3 = $$.d3;
  var svgLeft, hintLeft, hintRight, hintTop, chartRight;
  var forArc = $$.hasArcType(),
    mouse = d3.mouse(element);
  // Determin hint position
  if (forArc) {
    hintLeft = (($$.width - ($$.isLegendRight ? $$.getLegendWidth() : 0)) / 2) + mouse[0];
    hintTop = ($$.hasType('gauge') ? $$.height : $$.height / 2) + mouse[1] + 20;
  } else {
    svgLeft = $$.getSvgLeft(true);
    if (config.axis_rotated) {
      hintLeft = svgLeft + mouse[0] + 100;
      hintRight = hintLeft + tWidth;
      chartRight = $$.currentWidth - $$.getCurrentPaddingRight();
      hintTop = $$.x(dataToShow[0].x) + 20;
    } else {
      hintLeft = svgLeft + $$.getCurrentPaddingLeft(true) + $$.x(dataToShow[0].x) + 20;
      hintRight = hintLeft + tWidth;
      chartRight = svgLeft + $$.currentWidth - $$.getCurrentPaddingRight();
      hintTop = mouse[1] + 15;
    }

    if (hintRight > chartRight) {
      // 20 is needed for Firefox to keep hint width
      hintLeft -= hintRight - chartRight + 20;
    }
    if (hintTop + tHeight > $$.currentHeight) {
      hintTop -= tHeight + 30;
    }
  }
  if (hintTop < 0) {
    hintTop = 0;
  }
  return {
    top: hintTop,
    left: hintLeft
  };
};
ChartInternal.prototype.showHint = function (selectedData, element) {
  var $$ = this,
    config = $$.config;
  var tWidth, tHeight, position;
  var forArc = $$.hasArcType(),
    dataToShow = selectedData.filter(function (d) {
      return d && isValue(d.value);
    }),
    positionFunction = config.hint_position || ChartInternal.prototype.hintPosition;
  if (dataToShow.length === 0 || !config.hint_show) {
    return;
  }
  $$.hint.html(config.hint_contents.call($$, selectedData, $$.axis.getXAxisTickFormat(), $$.getYFormat(forArc), $$.color)).style("display", "block");

  // Get hint dimensions
  tWidth = $$.hint.property('offsetWidth');
  tHeight = $$.hint.property('offsetHeight');

  position = positionFunction.call(this, dataToShow, tWidth, tHeight, element);
  // Set hint
  $$.hint
    .style("top", position.top + "px")
    .style("left", position.left + 'px');
};
ChartInternal.prototype.hideHint = function () {
  this.hint.style("display", "none");
};
