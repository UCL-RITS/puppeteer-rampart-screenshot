const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const saveReport = async (page, directory) => {
	const openReportTab = async () => {
		const reportButtonElement = await page.$(
			`#root > div > div > div:nth-child(1) > div.buttons > button`
		);
		if (reportButtonElement === null) {
			console.log("No report tab was found");
			return;
		}
		await reportButtonElement.click();
		await page.waitForSelector(`#root > div > div > .open > div`);
	};

	const countTables = async () => {
		const tables = await page.$$(
			`#root > div > div > .open > div > :nth-child(2) > table`
		);
		return tables.length;
	};

	const getTableName = async (tableRef) => {
		return await page.$eval(
			`${tableRef} > caption`,
			(tableCaption) => tableCaption.innerText
		);
	};

	const getTableHeaderData = async (tableRef) => {
		const tableHeadData = await page.evaluate((tableRef) => {
			const thead = Array.from(
				document.querySelectorAll(`${tableRef} > thead > tr > th`)
			);
			return thead.map((thead) => thead.innerText);
		}, tableRef);

		// an alternative method to above (more abstract and less clear what it does)
		// const tableHeadData = await page.$$eval(
		// 	`${tableRef} > thead > tr > th`,
		// 	(theads) => theads.map((th) => th.innerText)
		// );

		// format header data to be inserted into csv
		return tableHeadData.map((header, index) => {
			return {
				id: index,
				title: header,
			};
		});
	};

	const getTableRowData = async (tableRef) => {
		// returns a tab separated string of row data
		return await page.evaluate((tableRef) => {
			const tbody = Array.from(
				document.querySelectorAll(`${tableRef} > tbody > tr`)
			);
			return tbody.map((tr) => tr.innerText);
		}, tableRef);
	};

	const parseTableData = async (tableRowData) => {
		// convert each table row data into an array of rowItems
		const parsedRowData = [];
		tableRowData.forEach((row) => {
			const splitRow = row.split("\t");
			parsedRowData.push(splitRow);
		});

		const csvRows = [];
		parsedRowData.map((row) => {
			let rowObject = {};
			row.map((rowItem, index) => {
				rowObject[index] = rowItem; // index will be the csv tab number where the rowItem exists
			});
			csvRows.push(rowObject);
		});

		return csvRows;
	};

	const writeTableToCsv = async (tableName, csvHeaders, csvRows) => {
		const csvWriter = createCsvWriter({
			path: fs.existsSync(`./${directory}/report_${tableName}.csv`)
				? `${directory}/report_${tableName}_${uuidv4()}.csv`
				: `${directory}/report_${tableName}.csv`,
			header: csvHeaders,
		});

		await csvWriter
			.writeRecords(csvRows)
			.then(() => {
				console.log(`saved '${tableName}' as .csv`);
			})
			.catch((error) => {
				console.log(
					`something went wrong trying to write report '${tableName}' as .csv \n${error}`
				);
			});
	};

	// App flow starts here
	await openReportTab();
	const tableCount = await countTables();
	if (tableCount === 0) {
		console.log("no tables were found");
		return;
	}

	// loop through each table and save the data as csv
	for (let i = 1; i < tableCount + 1; i++) {
		const tableRef = `#root > div > div > .open > div > div:nth-child(2) > table:nth-of-type(${i})`;

		const tableName = await getTableName(tableRef);
		const csvHeaders = await getTableHeaderData(tableRef);
		const tableRowData = await getTableRowData(tableRef);
		const csvRows = await parseTableData(tableRowData);
		await writeTableToCsv(tableName, csvHeaders, csvRows);
	}
};

exports.saveReport = saveReport;
