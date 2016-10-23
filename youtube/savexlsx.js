const fs = require('fs')
const json2xls = require("json2xls")
const path = require("path")

function saveXls(data, name) {
    var xls = json2xls(data);
    fs.writeFileSync(name, xls, 'binary');
    console.log("xlsx table " + name + " save OK!");
}

module.exports = (jsondata, filename) => {
    saveXls(jsondata, filename)
}