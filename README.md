This project allows users of the RAMPART project [https://github.com/artic-network/rampart](https://github.com/artic-network/rampart) to take automatic screenshots of RAMPART chart outputs.

---

## Requirements

You need to have Node.js installed on your local machine, this is required to handle npm packages.

https://nodejs.org/en/download/

Once Node is installed and you have cloned this project run the following from the root project directory.

```shell script
npm install
```

This will install all of the project dependencies specified in package.json.

---

## Running the project

First, make sure you have your RAMPART project running and that it is accessible from your localhost. The default location for active RAMPART projects is [http://localhost:3000](http://localhost:3000) and the application will assume this is the case unless further arguments are passed (see further below).

Once RAMPART is running, navigate to the root of this project and run:

```shell script
node app.js
```

The application will then automatically take screenshots of the charts in your active RAMPART session. Screenshots are saved as .png files in the project root under `/images`. Depending on how many charts you have in your project, it may take some time to finish taking all of the screenshots.

Once the program has started, puppeteer will open a temporary Chrome window to start taking screenshots. The window will automatically close again when the program has finished.

---

## Specifying a custom port

If you are using a custom port to run your RAMPART project you can make this application aware of this by passing in an argument when running the app:

```shell script
node app.js http://localhost:5000
```

This can also be handy if the application throws an error when attempting to connect to localhost (a known issue on some devices). In such circumstances you can specify your local ip address and port, for example:

```shell script
node app.js http://192.168.1.13:3000
```

When no arguments are passed the application will assume your RAMPART project is running from http://localhost:3000

---

## Compatibility with Rampart version

This application has been tested against Rampart version 1.1.0. This application relies on the structure of the Rampart page being constant, therefore future updates to Rampart may break this application.

---

## Timeout error

When running the application, you may occasionally experience this error: "TimeoutError: waiting for selector "[selector]" failed". This could be related to a potential puppeteer bug: [https://github.com/puppeteer/puppeteer/issues/4072](https://github.com/puppeteer/puppeteer/issues/4072). This error can usually be resolved by running the application again.

---

## Why does the application sometimes fail to screenshot every chart?

When viewing your image outputs you might occasionally notice that the application skipped a screenshot, or just took a screenshot of the tab bar containing the chart (and not the chart itself). This may be related to the above mentioned error [https://github.com/puppeteer/puppeteer/issues/4072](https://github.com/puppeteer/puppeteer/issues/4072). If this happens, try running the application again or take a manual screenshot of the charts that were missed.

---

## Additional Project Notes

This project uses puppeteer [https://github.com/puppeteer/puppeteer](https://github.com/puppeteer/puppeteer) to programatically interact with the browser.

---
