function setTemplate() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var rangeList = cellsToEdit().editRange;
    var weekToCopy = ss.getSheetByName('Week 2');
    var templateWeek = ss.getSheetByName('Template');
    rangeList.map(function (range) {
        var weekValues = weekToCopy.getRange(range).getValues();
        templateWeek.getRange(range).setValues(weekValues);
    });
}

function setWeeksFromTemplate() {
    var globals = getTemplateVariables();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var template = ss.getSheetByName('Template');
    var sheetsNotIncluded = globals.dontInclude;
    var rangeList = globals.editRange;
    var startingWeek = Browser.inputBox('What week to start on?');
    if (startingWeek.length > 2) startingWeek = ss.getSheetByName(startingWeek);
    else startingWeek = ss.getSheetByName('Week ' + startingWeek);
    //    Logger.log(startingWeek.getName().split(' ')[1]);


    sheets.forEach(function (sheet) {
      Logger.log(sheet);
        if (parseInt(sheet.getName().split(' ')[1]) < parseInt(startingWeek.getName().split(' ')[1])) {
            sheetsNotIncluded.push(sheet.getName());
        }

        var validation = true;
        sheetsNotIncluded.map(function (el) {
            if (sheet.getName() === el) {
                validation = false;
            }
        });

        if (validation) {
            rangeList.map(function (range) {
                template.getRange(range).copyTo(sheet.getRange(range), SpreadsheetApp.CopyPasteType.PASTE_VALUES);
            });
        }
    });
}