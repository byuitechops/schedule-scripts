function orderSheets(sheetObjects) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var valuesSheet = ss.getSheetByName('Variables');
    var sheetNums = ss.getNumSheets();
    var fridays = valuesSheet.getRange('semesterFridays').getValues();
    var Today = new Date();
    var today = Today.setHours(0, 0, 0, 0);

    // If you try to run this script before the semester starts, it will default var thisWeek to "Week 1"
    var thisWeek = sheetObjects[0];

    // Get the value of the currentWeek
    for (var i = 0; i < fridays.length; i++) {
        if (new Date(fridays[i]) - today > -604800000 && new Date(fridays[i]) - today <= 0) {
            thisWeek = sheetObjects[i];
        }
    }

    // Get the order of the sheets
    sheetObjects.map(function (sheetObj) {
        if (sheetObj.date < thisWeek.date) {
            sheetObj.position = 14 - (thisWeek.index - sheetObj.index) + 1;
        } else if (sheetObj.date > thisWeek.date) {
            sheetObj.position = sheetObj.index - thisWeek.index + 1;
        } else {
            sheetObj.position = 1;
        }
        //    Logger.log(sheetObj);
    });
    var sorted = sheetObjects.sort(function (a, b) {
        return a.position - b.position;
    });

    // Move sheets to the correct order
    sheetObjects.forEach(function (sheetObj) {
        ss.setActiveSheet(sheetObj.sheet);
        ss.moveActiveSheet(sheetObj.position);
    });

}


/***************************************************
 *          formatWeeks
 * 
 * Format all the sheets except the Variables sheet.
 * 
 * Uses Week 1 as the template for formatting
 * Uses Week 2 as the template for formulas
 * 
 * It uses formulas instead of hard-values so that if
 * a value needs to change, you only change it in one place, 
 * and that change perpetuates across all sheets
 * 
 * 
 **************************************************/
function formatWeeks() {
    var globals = getFormatVariables();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var source = ss.getSheetByName('Week 1');
    var range = globals.fullRange;
    var sourceRange = source.getRange(range);
    var sourceFormulas = ss.getSheetByName('Week 2').getRange(range).getFormulas();
    var sheets = ss.getSheets();
    var validationRange = ss.getSheetByName('Variables').getRange(globals.dataValidationRange);
    var rule = SpreadsheetApp.newDataValidation().requireValueInRange(validationRange).build();

    // A RangeList containing the cells where the schedules are input
    var rangeList = globals.editRange;

    // Set the data validation for just the source sheet
    dataValidation(source);

    // Set the width of the columns in the source sheet
    // Column widths defined in globals.js
    globals.columnWidths.forEach(function (widths) {
        if (widths.length === 3) {
            source.setColumnWidths(widths[0], widths[1], widths[2]);
        } else if (widths.length === 2) {
            source.setColumnWidth(widths[0], widths[1]);
        } else {
            Logger.log('Not a valid number of widths');
        }
    });

    // Copy the formatting from the source sheet (Week 1) to all other Week sheets
    // Copy the formulas from Week 2 to all other sheets
    sheets.forEach(function (sheet) {
        if (sheet.getName() !== 'Variables') {
            if (sheet.getName() !== 'Week 1') {
                var thisSheetsRange = sheet.getRange(range);
                // Copies all the schedule data from a sheet
                var data = copyOrPasteData(sheet, rangeList, 'copy');

                // sheet.clear();
                sheet.clearFormats()
                    .clearConditionalFormatRules();
                sheet.setFrozenColumns(source.getFrozenColumns());

                sourceRange.copyTo(thisSheetsRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT);
                // sourceRange.copyTo(thisSheetsRange, SpreadsheetApp.CopyPasteType.PASTE_CONDITIONAL_FORMATTING, false);
                sourceRange.copyTo(thisSheetsRange, SpreadsheetApp.CopyPasteType.PASTE_COLUMN_WIDTHS, false);

                thisSheetsRange.setFormulas(sourceFormulas);

                // This is to paste schedule data back into the sheet after a format change has been copied.
                copyOrPasteData(sheet, rangeList, 'paste', data);
            }
        }
    });

    // Set the data-validation rules
    function dataValidation(sheet) {
        // Remove all current data validation
        sheet.getRange(globals.fullRange).clearDataValidations();

        rangeList.forEach(function (item) {
            var destinationRange = sheet.getRange(item);
            var rules = destinationRange.getDataValidations();

            rules = rules.map(function (ruleContainer) {
                return ruleContainer.map(function () {
                    return rule;
                });
            });
            destinationRange.setDataValidations(rules);
        }); // end forEach
    } // end dataValidation
}

// Set the dates on each day of the week
// Should only have to run if the formula for the each day of the week gets changed or messed up
// The dates are dependent on 'Variables!C2' Change that date, and all other dates in the semester should change
function setDates() {
    var globals = getRandomVariables();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Variables');
    var range = sheet.getRange('C2:C16');
    var values = range.getDisplayValues();
    var cells = globals.cells; // The cells for each day of the week.
    for (var i = 1; i < values.length; i++) {
        var sheetname = ss.getSheetByName('Week ' + i);

        for (var j = 0; j < cells.length; j++) {
            var cell = sheetname.getRange(cells[j % 6]);

            // Set the forula for each day of the week to match the variable set on Variable sheet. 
            // should only have to run this one time total unless the dates get messed up.
            var operator = cell == 'D161' ? ' + ' : ' - ';
            var incrementor = operator === '+' ? 1 : j - 1;
            cell.setFormula('=Variables!C' + (i + 2) + operator + incrementor).setNumberFormat('dddd mmm dd, yyyy');

        } //end 'j' for loop
    } // end 'i' for loop
} //end function

function clearSchedule() {
    var globals = getRandomVariables();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    sheets.forEach(function (sheet) {
        if (sheet.getName() !== 'Variables') {
            var ranges = sheet.getRangeList(globals.editRange);
            ranges.clearContent().setBackground('white');
            sheet.getRange(globals.greyCells).setBackgroundRGB(202, 205, 203);
        }
    });
}

function copyOrPasteData(sheet, listRange, action, values) {
    values = values || [];
    // Figure out what action we're doing (Pasting or copying)
    if (action === 'copy') {
        listRange.forEach(function (range, i) {
            values[i] = sheet.getRange(range).getValues();
        });
        return values;

    } else if (action === 'paste') {
        listRange.forEach(function (range, i) {
            sheet.getRange(range).setValues(values[i]);
        })
    }

}