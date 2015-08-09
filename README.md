# speedometer
Angular JS directive for an HTML5-canvas speedometer type needle gauge.

Most of the canvas code originated in [Ray Hammond's](https://github.com/rheh) [HTML5-canvas-projects](https://github.com/rheh/HTML5-canvas-projects) project, specifically the [speedometer](https://geeksretreat.wordpress.com/2012/04/13/making-a-speedometer-using-html5s-canvas) that I've taken and used to create a customizable Angular JS directive. Big thanks to rheh!

## Usage
You must include the ridge-speedometer dependency on your angular module:

```var app = angular.module("demoApp", ["ridge-speedometer"]);```

The directive can be used as a:
* element
```<ridge-speedometer x-val="50" />```
* attribute
```<div ridge-speedometer x-val="50" />```
* class
```<div class="ridge-speedometer" x-val="50" />```

#### The directive takes 3 attributes:

```<ridge-speedometer x-val="88" x-conf="{backgroundColor: 'black'}" x-label="MPH" />```
* val - The value on the dial the needle points to
* conf - A configuration object for the speedometer, see all configuration options below
* label - An optional label displayed under the speedometer

## Customization Options
The speedometer can be customized by setting values on the conf attribute.
This can be done in the HTML:

```<ridge-speedometer x-conf="{backgroundColor: 'white', wobble: true, min: 25, max: 50}" />```

Or in your controller:

HTML

```<ridge-speedometer x-conf"speedometerOptions" />```

JS

```
angular.module( 'demoApp', ['ridge-speedometer'])
.controller('demoCtl, function($scope){
  $scope.speedometerOptions = {
    backgroundColor: 'white',
    markerColor: 'black',
    smallTickColor: 'black',
    largeTickColor: 'black'
  }
})
```
#### Available Options

* size
  * Default: fills up its parent element
  * the width of the speedometer, height is always set to half the width. If not set the speedometer fills up its parent element
*	redrawPeriod 
  * Default: 30
  * on speedometer value changes the needle moves incrementally towards the new value, this option specifies how frequently in milliseconds the needle moves
*	backgroundColor
  * Default: 'rgb(0,0,0)'
*	backgroundAlpha
  * Default: 0.2
*	wobble
  * Default: false
  * a boolean for whether or not the needle "wobbles" when values don't change, gives the illusion of an active speedometer even if values aren't changing
*	edgeSize
  * Default: .97
  *  a percentage of the speedometer's radius used to draw the inner part of the edge of the speedometer. Closer to 1 = smaller edge, closer to 0 = bigger edge.
*	edgeOuterColor
  * Default: "rgb(127,127,127)"
*	edgeOuterAlpha
  * Default: 0.5
*	edgeInnerColor
  * Default: "rgb(255,255.255)"
*	edgeInnerAlpha
  * Default: 0.5
*	min
  * Default: 0
  * the minimum value of the speedometer
*	max
  * Default: 100
  * the maximum value of the speedometer
*	smallTickColor
  * Default: "rgb(255,255,255)"
  * color of the minor ticks
*	smallTickAlpha
  * Default: 1
  * alpha of the minor ticks
*	smallTickWidth
  * Default: 1
  * width of the minor ticks
*	smallTickIncrement
  * Default: 5
  * how far apart the minor ticks are spaced
*	largeTickColor
  * Default: "rbg(255,255,255)"
  * color of the major ticks
*	largeTickAlpha
  * Default: 1
  * alpha of the major ticks
*	largeTickIncrement
  * Default: 10
  * how far apart the major ticks are spaced (also applied to the text markers)
*	largeTickWidth
  * Default: 3
  * width of the major ticks
*	markerFont
  * Default: 'italic 10px sans-serif'
  * font of the text markers
*	markerBaseline
  * Default: 'top'
*	markerColor
  * Default: 'rgb(255,255,255)'
  * color of the text markers
*	markerAlpha
  * Default: 1
  * alpha of the text markers
*	colorArcWidth
  * Default: 5
  * width of the colored status arc
*	normalColor
  * Default: "rgb(82, 240, 55)"
  * color of the "normal" part of the status arc
*	warningColor
  * Default: "rgb(198, 111, 0)"
  * color of the "warning" part of the status arc
*	criticalColor
  * Default: "rgb(255,0,0)"
  * color of the "critical" part of the status arc
*	endOfNormalDegree
  * Default: 200
  * degree where the normal and warning parts of the status arc meet
*	endOfWarningDegree
  * Default: 280
  * degree where the warning and critical parts of the status arc meet
*	needleColor
  * Default: "#ff8300"
  * color of the needle
*	needleAlpha
  * Default: 1
  * alpha of the needle
*	needleWidth
  * Default: 5
  * width of the needle
*	needleBaseColor1
  * Default: "rgb(127,127,127)"
  * main color of the needle base semi-circle
*	needleBaseColor2
  * Default: "rgb(255,255,255)"
  * secondary color of the needle base semi-circle
*	needleBaseAlpha1
  * Default: 0.6
  * alpha of the main part of the needle base semi-circle
*	needleBaseAlpha2
  * Default: 0.2
  * alpha of the secondary part of the needle base semi-circle
*	needleBaseSize
  * Default 30
  * size of the needle base semi-circle
