var fs = require("fs");
var Canvas = require("canvas");

var {data, pretty} = JSON.parse(fs.readFileSync("data.json").toString());

var width = 1200;
var height = 200;

var padding = 25;
var dotRadius = 7.5;

var canvas = Canvas.createCanvas(width + padding * 2, height + padding * 2);
var context = canvas.getContext("2d");

context.beginPath();
context.fillStyle = "white";
context.rect(0, 0, width + padding * 2, height + padding * 2);
context.fill();

context.beginPath();
context.strokeStyle = "blue";
context.lineWidth = 1;

context.moveTo(padding, padding);
context.lineTo(padding, height + padding);
context.lineTo(width + padding, height + padding);
context.lineTo(width + padding, padding);
context.lineTo(padding, padding);

context.stroke();

function drawDot(x, y, color, radius){
	if (radius === undefined){
		radius = dotRadius;
	}
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2, false);
	context.fillStyle = color;
	context.fill();
}

function drawText(x, y, text, below){
	context.fillStyle = "black";
	context.font = "normal 15px aerial"

	if (below !== undefined){
		y = below ? y + (dotRadius * 2 + dotRadius / 4) : y - (dotRadius + dotRadius / 4)
	}

	context.fillText(text, x, y);
}

function getX(decimal){
	return decimal * width + padding;
}

function getY(point){
	return point + padding;
}

function getDivisiorsOf(number){
	var divisiors = [1];
	for (var i = 2; i <= number; i++){
		if (number % i === 0){
			divisiors.push(i);
		}
	}
	return divisiors;
}

function reduceFraction(numerator, denominator){
	var numDivisors = getDivisiorsOf(numerator);
	var denDivisors = getDivisiorsOf(denominator);

	var gcm = numDivisors.reduce((gcm, divisor) => {
		if (denDivisors.indexOf(divisor) === -1){
			return gcm;
		}
		return divisor;
	}, 1);

	return [numerator / gcm, denominator / gcm]
}

function findFraction(decimal){
	for (var i = 1; i <= 32; i++){
		var result = i / 32;
		if (result === decimal){
			return reduceFraction(i, 32);
		}
	}
	return null;
}

drawText(padding, getY(50), "3/8in")
drawText(padding, getY(150), "1/4in")

// Should really turn this into a for loop.
drawText(getX(0), getY(195), "0")
drawDot(getX(0), getY(200), "black", 5)
drawText(getX(0.125), getY(195), "1/8")
drawDot(getX(0.125), getY(200), "black", 5)
drawText(getX(0.25), getY(195), "1/4")
drawDot(getX(0.25), getY(200), "black", 5)
drawText(getX(0.375), getY(195), "3/8")
drawDot(getX(0.375), getY(200), "black", 5)
drawText(getX(0.5), getY(195), "1/2")
drawDot(getX(0.5), getY(200), "black", 5)
drawText(getX(0.625), getY(195), "5/8")
drawDot(getX(0.625), getY(200), "black", 5)
drawText(getX(0.75), getY(195), "3/4")
drawDot(getX(0.75), getY(200), "black", 5)
drawText(getX(0.875), getY(195), "5/8")
drawDot(getX(0.875), getY(200), "black", 5)
drawText(getX(1), getY(195), "1")
drawDot(getX(1), getY(200), "black", 5)

data.forEach(row => {
	var y;
	var color;

	if (row.drive === "1/4"){
		y = 150;
	}
	else{
		y = 50;
	}

	if (row.label === "in"){
		color = "green";
		y += 25;
	}
	else{
		color = "red";
		y -= 25;
	}

	var text = findFraction(row.in);
	text = text === null ? row.mm : text.join("/");

	drawDot(getX(row.in), getY(y), color);
	drawText(getX(row.in), getY(y), text, false);
});

/*
context.font = '30px Impact';
context.rotate(.1);
context.fillText("Awesome!", 50, 100);

var te = context.measureText('Awesome!');
context.strokeStyle = 'rgba(0,0,0,0.5)';
context.beginPath();
context.lineTo(50, 102);
context.lineTo(50 + te.width, 102);
context.stroke();
*/
var out = fs.createWriteStream("output.png");
var stream = canvas.pngStream();

stream.on("data", chunk => out.write(chunk));
stream.on("end", () => console.log("saved png"));