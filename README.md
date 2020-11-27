This application allows users of the RAMPART project [https://github.com/artic-network/rampart](https://github.com/artic-network/rampart) to take automatic screenshots of RAMPART chart outputs using puppeteer https://github.com/puppeteer/puppeteer](https://github.com/puppeteer/puppeteer).

The application will also save the table data in the RAMPART reports tab into separate .csv files.

---

## Requirements

You need to have Node.js (at least version 10.18.1) installed on your local machine, this is required to handle npm packages. Note that RAMPART also requires Node.js to be at least version 10 or above so you should be able to rely on the version of Node.js that is already running your rampart project.

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

The application will then automatically take screenshots of the charts in your active RAMPART session. Screenshots are saved as .png files in the project root under `/outputs`. Depending on how many charts you have in your project, it may take some time to finish taking all of the screenshots. Any screenshots that fail (see below for possible errors) will have "-failed" appended to the filename.

The .csv table data in the RAMPART reports tab will also be saved into the `/outputs` directory.

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

## Fullpage screenshot issues

There is currently a known chromium bug that is affecting the behaviour of some fullpage screenshots, see here for more information [https://github.com/puppeteer/puppeteer/issues/1576](https://github.com/puppeteer/puppeteer/issues/1576). This seems to affect pages that have a large viewport height and causes the fullpage screenshot to duplicate content.

This application currently uses a workaround to take the fullpage screenshot until the above bug is fixed. This workaround uses Jimp [https://www.npmjs.com/package/jimp](https://www.npmjs.com/package/jimp) to merge several screenshots into a fullpage image.

---

## Timeout error

When running the application, you may occasionally experience this error: "TimeoutError: waiting for selector "[selector]" failed". This could be related to a potential puppeteer bug: [https://github.com/puppeteer/puppeteer/issues/4072](https://github.com/puppeteer/puppeteer/issues/4072).

When this error occurs the application will try to continue taking screenshots of the remaining charts so you will need to take the screenshot of the failed chart manually.

---

## Why does the application sometimes fail to screenshot every chart?

When viewing your image outputs you might occasionally notice that the application did not take a screenshot of every chart, or just took a screenshot of the tab bar containing the chart (in which case the image name will have "-failed" appended). This is related to the above mentioned timeout error [https://github.com/puppeteer/puppeteer/issues/4072](https://github.com/puppeteer/puppeteer/issues/4072). If this happens, try running the application again or take a manual screenshot of the charts that were missed.

Any charts that fail to produce a successful screenshot will have "-failed" appened to the image name in the outputs folder (e.g. Mayinga-failed.png) and you will therefore need to take a screenshot of this image manually.

---

## Compatibility

All features have been tested against Rampart version 1.1.0. This application relies on the structure of the Rampart page being constant, therefore future updates to Rampart may cause errors.

---
