var module = angular.module( 'ridge-speedometer', [] );

module.directive( 'ridgeSpeedometer', [ '$timeout', function( $timeout ){
	return {
		restrict: 'EAC',
		scope: { targetVal: '=val', conf: '=', label: '@' },
		template: '<canvas>HTML Canvas not supported by your browser</canvas><div class="ridge-speedometer-label" style="text-align: center">{{label}}</div>',
		link: function( scope, el ){
			scope.val = 0;

			var conf = setupConf( scope.conf );

			if( isNaN( scope.targetVal ) ){
				scope.targetVal = conf.min;
			}
			else if( scope.targetVal < conf.min){
				scope.targetVal = conf.min;
			}
			else if( scope.targetVal > conf.max ){
				scope.targetVal = conf.max;
			}
			
			if( conf.size )
				angular.element(el).find('canvas').attr( 'width', conf.size).attr( 'height', Math.floor( conf.size/2) );

			function draw() {
				var canvas = angular.element(el).find('canvas')[0],
				    options = null;
				
				// Canvas good?
				if (canvas !== null && canvas.getContext) {

					options = buildOptionsAsJSON(canvas, scope.val, conf );

				    // Clear canvas
				    clearCanvas(options);

					// Draw the styled edge
					drawEdgeArcs(options, "outer");
					drawEdgeArcs(options, "inner");

					// Draw thw background
					drawBackground(options);

					// Draw tick marks
					drawTickMarks(options, "large");
					drawTickMarks(options, "small");

					// Draw labels on markers
					drawTextMarkers(options);

					// Draw speeometer colour arc
					drawGaugeColourArc(options);

					// Draw the needle and base
					drawNeedle(options);
					
				} else {
					alert("HTML Canvas not supported by your browser!");
				}

				// Give the imppression of an "active" needle even if
				// our values are staying the same
				
				if( scope.val == scope.targetVal ){
					if( conf.wobble )
						scope.val = scope.val + 1;
				}
				else if ( scope.val < scope.targetVal ){
					if( scope.val+10 < scope.targetVal )
						scope.val = scope.val + 5;
					else
						scope.val = scope.val + 1;
				}
				else{
					if( scope.val-10 > scope.targetVal )
						scope.val = scope.val -5;
					else
						scope.val = scope.val - 1;
				}
				
				$timeout( draw, conf.redrawPeriod );
				
			}
			draw();
		}
	};
}])

function degToRad(angle) {
	// Degrees to radians
	return ((angle * Math.PI) / 180);
}

function radToDeg(angle) {
	// Radians to degree
	return ((angle * 180) / Math.PI);
}

function drawLine(options, line) {
	// Draw a line using the line object passed in
	options.ctx.beginPath();

	// Set attributes of open
	options.ctx.globalAlpha = line.alpha;
	options.ctx.lineWidth = line.lineWidth;
	options.ctx.fillStyle = line.fillStyle;
	options.ctx.strokeStyle = line.fillStyle;
	options.ctx.moveTo(line.from.X,
		line.from.Y);

	// Plot the line
	options.ctx.lineTo(
		line.to.X,
		line.to.Y
	);

	options.ctx.stroke();
}

function createLine(fromX, fromY, toX, toY, fillStyle, lineWidth, alpha) {
	// Create a line object using Javascript object notation
	return {
		from: {
			X: fromX,
			Y: fromY
		},
		to:	{
			X: toX,
			Y: toY
		},
		fillStyle: fillStyle,
		lineWidth: lineWidth,
		alpha: alpha
	};
}

function drawEdgeArcs(options, type) {

	options.ctx.beginPath();
	options.ctx.fillStyle = type == "inner" ? options.gaugeOptions.edgeInnerColor : options.gaugeOptions.edgeOuterColor;
	options.ctx.globalAlpha = type == "outer" ? options.gaugeOptions.edgeInnerAlpha : options.gaugeOptions.edgeOuterAlpha;

	options.ctx.arc(options.center.X,
					options.center.Y,
					type == "inner" ? Math.floor(options.gaugeOptions.edgeSize*options.radius) : options.radius,
					0,
					Math.PI,
					true);

	options.ctx.fill();
}

function drawBackground(options) {

    var i = 0;
	options.ctx.globalAlpha = options.gaugeOptions.backgroundAlpha;
	options.ctx.fillStyle   = options.gaugeOptions.backgroundColor;

	for (i = Math.floor(options.radius*.87); i < Math.floor(options.radius*.98); i++) {
		options.ctx.beginPath();
		options.ctx.arc(options.center.X,
			options.center.Y,
			i,
			0,
			Math.PI,
			true);
		options.ctx.fill();
	}
}

function applyDefaultContextSettings(options) {
	/* Helper function to revert to gauges
	 * default settings
	 */
	options.ctx.lineWidth   = 2;
	options.ctx.globalAlpha = 0.5;
	options.ctx.strokeStyle = "rgb(255,255,255)";
	options.ctx.fillStyle   = "rgb(255,255,255)";
}

function drawTickMarks(options, type) {

	var tickvalue = options.levelRadius - ( type == "large" ? 2 : 8 ),
	    iTick = 0,
        gaugeOptions = options.gaugeOptions,
        tickIncrement = type == "large" ? gaugeOptions.largeTickIncrement : gaugeOptions.smallTickIncrement,
        tickColor = type == "large" ? gaugeOptions.largeTickColor : gaugeOptions.smallTickColor,
        tickAlpha = type == "large" ? gaugeOptions.largeTickAlpha : gaugeOptions.smallTickAlpha,
        tickWidth = type == "large" ? gaugeOptions.largeTickWidth : gaugeOptions.smallTickWidth,
        iTickRad = 0,
        innerTickY,
        innerTickX,
        onArchX,
        onArchY,
        fromX,
        fromY,
        toX,
        toY,
        line;

	applyDefaultContextSettings(options);

	var degreeIncrement = (gaugeOptions.maxDegree - gaugeOptions.minDegree)/((gaugeOptions.max-gaugeOptions.min)/(tickIncrement))

	for (iTick = gaugeOptions.minDegree; iTick <= gaugeOptions.maxDegree; iTick += degreeIncrement) {

		iTickRad = degToRad(iTick);

		/* Calculate the X and Y of both ends of the
		 * line I need to draw at angle represented at Tick.
		 * The aim is to draw the a line starting on the 
		 * coloured arc and continueing towards the outer edge
		 * in the direction from the center of the gauge. 
		 */

		onArchX = gaugeOptions.radius - (Math.cos(iTickRad) * tickvalue);
		onArchY = gaugeOptions.radius - (Math.sin(iTickRad) * tickvalue);
		innerTickX = gaugeOptions.radius - (Math.cos(iTickRad) * gaugeOptions.radius);
		innerTickY = gaugeOptions.radius - (Math.sin(iTickRad) * gaugeOptions.radius);

		fromX = (options.center.X - gaugeOptions.radius) + onArchX;
		fromY = (gaugeOptions.center.Y - gaugeOptions.radius) + onArchY;
		toX = (options.center.X - gaugeOptions.radius) + innerTickX;
		toY = (gaugeOptions.center.Y - gaugeOptions.radius) + innerTickY;

		// Create a line expressed in JSON
		line = createLine(fromX, fromY, toX, toY, tickColor, tickWidth, tickAlpha);

		// Draw the line
		drawLine(options, line);
	}
}

function drawTextMarkers(options) {

	var innerTickX = 0,
	    innerTickY = 0,
        iTick = 0,
        gaugeOptions = options.gaugeOptions,
        iTickToPrint = 0;

	applyDefaultContextSettings(options);

	// Font styling
	options.ctx.font = gaugeOptions.markerFont;
	options.ctx.textBaseline = gaugeOptions.markerBaseline;
	options.ctx.fillStyle = gaugeOptions.markerColor;
	options.ctx.globalAlpha = gaugeOptions.markerAlpha;
	options.ctx.beginPath();
	var degreeIncrement = (gaugeOptions.maxDegree-gaugeOptions.minDegree)/((gaugeOptions.max-gaugeOptions.min)/gaugeOptions.largeTickIncrement)
	
	for (iTick = gaugeOptions.minDegree; iTick <= gaugeOptions.maxDegree; iTick += degreeIncrement) {

		innerTickX = gaugeOptions.radius - (Math.cos(degToRad(iTick)) * gaugeOptions.radius);
		innerTickY = gaugeOptions.radius - (Math.sin(degToRad(iTick)) * gaugeOptions.radius);

		// Some cludging to center the values (TODO: Improve)
		if (iTick <= 10) {
			options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY + 5);
		} else if (iTick < 50) {
			options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX - 5,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY + 5);
		} else if (iTick < 90) {
			options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY);
		} else if (iTick === 90) {
			options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX + 4,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY);
		} else if (iTick < 145) {
			options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX + 10,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY);
		} else {
			options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX + 15,
					(gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY + 5);
		}
		
		iTickToPrint += Math.round(gaugeOptions.largeTickIncrement);
	}

    options.ctx.stroke();
}

function drawGaugePart(options, alphaValue, strokeStyle, startPos) {
	/* Draw part of the arc that represents
	* the colour Gauge arc
	*/

	options.ctx.beginPath();

	options.ctx.globalAlpha = alphaValue;
	options.ctx.lineWidth = options.gaugeOptions.colorArcWidth;
	options.ctx.strokeStyle = strokeStyle;

	options.ctx.arc(options.center.X,
		options.center.Y,
		options.levelRadius,
		Math.PI + (Math.PI / 360 * startPos),
		0 - (Math.PI / 360 * 10),
		false);

	options.ctx.stroke();
}

function drawGaugeColourArc(options) {
	/* Draws the colour arc.  Three different colours
	 * used here; thus, same arc drawn 3 times with
	 * different colours.
	 * TODO: Gradient possible?
	 */
	var gaugeOptions = options.gaugeOptions;

	drawGaugePart(options, 1.0, gaugeOptions.normalColor, gaugeOptions.startOfNormalDegree || gaugeOptions.minDegree);
	drawGaugePart(options, 0.9, gaugeOptions.warningColor, gaugeOptions.endOfNormalDegree);
	drawGaugePart(options, 0.9, gaugeOptions.criticalColor, gaugeOptions.endOfWarningDegree);

}

function drawNeedleDial(options, alphaValue, strokeStyle, fillStyle) {

    var i = 0;

	options.ctx.globalAlpha = alphaValue;
	options.ctx.lineWidth = 3;
	options.ctx.strokeStyle = strokeStyle;
	options.ctx.fillStyle = fillStyle;

	// Draw several transparent circles with alpha
	for (i = 0; i < options.gaugeOptions.needleBaseSize; i++) {
		options.ctx.beginPath();
		options.ctx.arc(options.center.X,
			options.center.Y,
			i,
			0,
			Math.PI,
			true);

		options.ctx.fill();
		options.ctx.stroke();
	}
}

function convertValToAngle(options, increment) {
	/* Helper function to convert a value to the 
	* equivelant angle.
	*/
	var iVal = (options.val / increment),
		gaugeOptions = options.gaugeOptions,
		degIncrement = (gaugeOptions.maxDegree-gaugeOptions.minDegree)/((gaugeOptions.max-gaugeOptions.min)/increment)
	    iValAsAngle = ((iVal * degIncrement) + options.gaugeOptions.minDegree) % 180;

	// Ensure the angle is within range
	if (iValAsAngle > gaugeOptions.maxDegree) {
        iValAsAngle = iValAsAngle - gaugeOptions.maxDegree;
    } else if (iValAsAngle < gaugeOptions.minDegree) {
        iValAsAngle = iValAsAngle + gaugeOptions.maxDegree;
    }

	return iValAsAngle;
}

function drawNeedle(options) {

	var iValAsAngleRad = degToRad(convertValToAngle(options, options.gaugeOptions.largeTickIncrement)),
        gaugeOptions = options.gaugeOptions,
        innerTickX = gaugeOptions.radius - (Math.cos(iValAsAngleRad) ),
        innerTickY = gaugeOptions.radius - (Math.sin(iValAsAngleRad) ),
        fromX = (options.center.X - gaugeOptions.radius) + innerTickX,
        fromY = (gaugeOptions.center.Y - gaugeOptions.radius) + innerTickY,
        endNeedleX = gaugeOptions.radius - (Math.cos(iValAsAngleRad) * gaugeOptions.radius),
        endNeedleY = gaugeOptions.radius - (Math.sin(iValAsAngleRad) * gaugeOptions.radius),
        toX = (options.center.X - gaugeOptions.radius) + endNeedleX,
        toY = (gaugeOptions.center.Y - gaugeOptions.radius) + endNeedleY,
        line = createLine(fromX, fromY, toX, toY, gaugeOptions.needleColor, gaugeOptions.needleWidth, gaugeOptions.needleAlpha);

	drawLine(options, line);

	// Two circle to draw the dial at the base (give its a nice effect?)
	drawNeedleDial(options, gaugeOptions.needleBaseAlpha1, gaugeOptions.needleBaseColor1, gaugeOptions.needleBaseColor2);
	drawNeedleDial(options, gaugeOptions.needleBaseAlpha2, gaugeOptions.needleBaseColor1, gaugeOptions.needleBaseColor1);

}

function buildOptionsAsJSON(canvas, iVal, conf) {
	/* Setting for the gauge 
	* Alter these to modify its look and feel
	*/
	var centerX = Math.floor( canvas.width/2 ),
	    centerY = canvas.height,
        radius = Math.floor( canvas.height*2/3 ),
        outerRadius = Math.floor( canvas.height*10/11 );

	// Create a gauge object using Javascript object notation
	return {
		ctx: canvas.getContext('2d'),
		val: iVal,
		center:	{
			X: centerX,
			Y: centerY
		},
		levelRadius: radius - 10,
		gaugeOptions: {
			center:	{
				X: centerX,
				Y: centerY
			},
			radius: radius,
			edgeSize: conf.edgeSize,
			edgeOuterColor: conf.edgeOuterColor,
			edgeOuterAlpha: conf.edgeOuterAlpha,
			edgeInnerColor: conf.edgeInnerColor,
			edgeInnerAlpha: conf.edgeInnerAlpha, 
			backgroundColor: conf.backgroundColor,
			backgroundAlpha: conf.backgroundAlpha,
			smallTickColor: conf.smallTickColor,
			smallTickAlpha: conf.smallTickAlpha,
			smallTickWidth: conf.smallTickWidth,
			smallTickIncrement: conf.smallTickIncrement,
			largeTickColor: conf.largeTickColor,
			largeTickAlpha: conf.largeTickAlpha,
			largeTickIncrement: conf.largeTickIncrement,
			largeTickWidth: conf.largeTickWidth,
			markerFont: conf.markerFont,
			markerBaseline: conf.markerBaseline,
			markerColor: conf.markerColor,
			markerAlpha: conf.markerAlpha,
			colorArcWidth: conf.colorArcWidth,
			normalColor: conf.normalColor,
			warningColor: conf.warningColor,
			criticalColor: conf.criticalColor,
			min: conf.min,
			max: conf.max,
			minDegree: conf.minDegree,
			maxDegree: conf.maxDegree,
			endOfNormalDegree: conf.endOfNormalDegree,
			endOfWarningDegree: conf.endOfWarningDegree,
			needleColor: conf.needleColor,
			needleAlpha: conf.needleAlpha,
			needleWidth: conf.needleWidth,
			needleBaseColor1: conf.needleBaseColor1,
			needleBaseColor2: conf.needleBaseColor2,
			needleBaseAlpha1: conf.needleBaseAlpha1,
			needleBaseAlpha2: conf.needleBaseAlpha2,
			needleBaseSize: conf.needleBaseSize,
		},
		radius: outerRadius
	};
}

function clearCanvas(options) {
	options.ctx.clearRect(0, 0, options.width, options.height);
	applyDefaultContextSettings(options);
}

function setupConf( conf ) {
	conf = conf || {};
	newConf = {
		minDegree: 10,
		maxDegree: 170,
	};
	var defaults = {
		size: undefined,
		redrawPeriod: 30,
		backgroundColor: 'rgb(0,0,0)',
		backgroundAlpha: 0.2,
		wobble: false,
		edgeSize: .97,
		edgeOuterColor: "rgb(127,127,127)",
		edgeOuterAlpha: 0.5,
		edgeInnerColor: "rgb(255,255.255)",
		edgeInnerAlpha: 0.5,
		min: 0,
		max: 100,
		smallTickColor: "rgb(255,255,255)",
		smallTickAlpha: 1,
		smallTickWidth: 1,
		smallTickIncrement: 5,
		largeTickColor: "rbg(255,255,255)",
		largeTickAlpha: 1,
		largeTickIncrement: 10,
		largeTickWidth: 3,
		markerFont: 'italic 10px sans-serif',
		markerBaseline: 'top',
		markerColor: 'rgb(255,255,255)',
		markerAlpha: 1,
		colorArcWidth: 5,
		normalColor: "rgb(82, 240, 55)",
		warningColor: "rgb(198, 111, 0)",
		criticalColor: "rgb(255,0,0)",
		endOfNormalDegree: 200,
		endOfWarningDegree: 280,
		needleColor: "#ff8300",
		needleAlpha: 1,
		needleWidth: 5,
		needleBaseColor1: "rgb(127,127,127)",
		needleBaseColor2: "rgb(255,255,255)",
		needleBaseAlpha1: 0.6,
		needleBaseAlpha2: 0.2,
		needleBaseSize: 30,
		width: 800,
		height: 400,
	}
	Object.keys( defaults ).forEach( function(key){
		newConf[key] = conf[key] || defaults[key];
	})

	return newConf;
}