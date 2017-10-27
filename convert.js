var fs = require("fs");

var rawData = fs.readFileSync("./sockets.csv").toString();

var rows = rawData.trim().split("\n").map((row, i) => {
	if (i === 0){
		return;
	}
	var cells = row.split(",");
	return {
		drive: cells[0].split("-").join("/"),
		label: cells[1],
		in: cells[2].split("-").join("/"),
		mm: cells[3]
	};
}).filter(cell => cell);

var data = rows.map(row => {
	if (row.label === "in"){
		row.in = row.in.split("/").reduce((result, part) => {
			if (result == null){
				result = part;
			}
			else{
				result /= part;
			}
			return result;
		}, null);
		row.mm = parseFloat((row.in * 25.4).toFixed(5));
	}
	else{
		row.mm = parseFloat(row.mm);
		row.in = parseFloat((row.mm * 0.0393701).toFixed(5));
	}
	return row;
});

data.sort((a, b) => {
	return a.in - b.in
});

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

var fractionedData = data.map(row => {
	// Don't change the original data rows.
	row = Object.assign({}, row);

	var fraction = findFraction(row.in);
	row.in = fraction === null ? row.in : fraction.join("/");
	return row;
});

var fractionedChanges = fractionedData.filter((row, i) => {
	return row.in !== data[i].in;
});

console.log(fractionedChanges);

console.log(data)

fs.writeFileSync("data.json", JSON.stringify({data, pretty: fractionedChanges}, null, "\t"))