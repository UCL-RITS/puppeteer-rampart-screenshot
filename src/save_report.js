const { v4: uuidv4 } = require("uuid");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const saveReport = async (page, directory, delay) => {
	const openReportTab = async () => {
		// click the report button to open the tab
		const reportButtonElement = await page.$(
			`#root > div > div > div:nth-child(1) > div.buttons > button`
		);
		if (reportButtonElement === null) {
			console.log("No report tab was found");
			return;
		}
		await reportButtonElement.click(); // open the report tab

		// wait for the table content to appear in the dom
		await page.waitForSelector(`#root > div > div > .open > div`);
	};

	const countTables = async () => {
		const tableData = await page.$$(
			`#root > div > div > .open > div > :nth-child(2) > table`
		);
		return tableData.length;
	};

	const getTableName = async (tableRef) => {
		const tableName = await page.$eval(
			`${tableRef} > caption`,
			(el) => el.innerText
		);
		return tableName;
	};

	const getTableHeaderData = async (tableRef) => {
		const tableHeadData = await page.evaluate((tableRef) => {
			const thead = Array.from(
				document.querySelectorAll(`${tableRef} > thead > tr > th`)
			);
			return thead.map((th) => th.innerText);
		}, tableRef);

		// an alternative method to above (more abstract and less clear what it does)
		// const tableHeadData = await page.$$eval(
		// 	`${tableRef} > thead > tr > th`,
		// 	(theads) => theads.map((th) => th.innerText)
		// );

		// format header data to be inserted into csv
		const csvHeaders = tableHeadData.map((header, index) => {
			return {
				id: index,
				title: header,
			};
		});
		return csvHeaders;
	};

	const getTableRowData = async (tableRef) => {
		const tableRowData = await page.evaluate((tableRef) => {
			const tbody = Array.from(
				document.querySelectorAll(`${tableRef} > tbody > tr`)
			);
			return tbody.map((tr) => tr.innerText);
		}, tableRef);

		return tableRowData;
	};

	const parseTableData = async (tableRowData) => {
		// extract content from each table row
		const parsedRowData = [];
		tableRowData.forEach((element) => {
			const splitRow = element.split("\t");
			parsedRowData.push(splitRow);
		});
		// console.log(parsedRowData);

		const csvRows = [];
		parsedRowData.map((row) => {
			let obj = {};
			row.map((inner, index) => {
				obj[index] = inner;
			});
			csvRows.push(obj);
		});

		// console.log(csvRows);
		return csvRows;
	};

	const saveTableToCsv = async (tableName, csvHeaders, csvRows, index) => {
		// write data to csv
		const csvWriter = createCsvWriter({
			path: `${directory}/${tableName}.csv`,
			header: csvHeaders,
		});

		await csvWriter
			.writeRecords(csvRows)
			.then(() => {
				console.log(`saved ${tableName} as .csv`);
			})
			.catch((error) => {
				console.log(
					`something went wrong trying to write report_${index} as .csv`
				);
				console.error(error);
			});
	};

	// App flow starts here
	await openReportTab();
	const tableCount = await countTables();

	// loop through each table and save the data as csv
	for (let i = 1; i < tableCount + 1; i++) {
		const tableRef = `#root > div > div > .open > div > div:nth-child(2) > table:nth-of-type(${i})`;

		const tableName = await getTableName(tableRef);
		const csvHeaders = await getTableHeaderData(tableRef);
		const tableRowData = await getTableRowData(tableRef);
		const csvRows = await parseTableData(tableRowData);
		await saveTableToCsv(tableName, csvHeaders, csvRows, i);
	}
};

exports.saveReport = saveReport;
