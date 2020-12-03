const fs = require("fs");

const createDirectories = async () => {
	// get the current date in YYYY-MM-DD format (for creating directories)
	let timeStamp = Date.now();
	let dateObject = new Date(timeStamp);
	let date = dateObject.getDate();
	let month = dateObject.getMonth() + 1;
	let year = dateObject.getFullYear();

	const imagesDirectory = `./outputs/${
		year + "-" + month + "-" + date + "-" + timeStamp
	}`;
	const reportsDirectory = `${imagesDirectory}/reports`;

	if (!fs.existsSync(reportsDirectory)) {
		fs.mkdirSync(reportsDirectory, { recursive: true });
	}

	const tempImagesDirectory = "./outputs/tempImages";
	if (!fs.existsSync(tempImagesDirectory)) {
		fs.mkdirSync(tempImagesDirectory, { recursive: true });
	}

	return {
		imagesDirectory: imagesDirectory,
		reportsDirectory: reportsDirectory,
		tempImagesDirectory: tempImagesDirectory,
	};
};

exports.createDirectories = createDirectories;
