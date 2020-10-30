const screenshot = require("./screenshot/screenshot");

let url = process.argv[2]; // process arguments
if (!url) {
	console.log(
		"No arguments passed to specify url. Defaulting to http://localhost:3000"
	);
	url = "http://localhost:3000";
}

screenshot.takeScreenshots(url);
