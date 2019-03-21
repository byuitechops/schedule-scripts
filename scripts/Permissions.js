//Functions to automatically unlock two sheets (weeks) at a time 
//Trigger for function set to go off every Friday at 5:00pm 
//Go to 'Edit' then 'Current Project's Triggers' to manage and set triggers
//setPermissions function compares the current date to the last friday of each week in the semester to determine which weeks need to be open and available to edit by the user
function setPermissions() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var Today = new Date();
    var today = Today.setHours(0, 0, 0, 0);
    var sheets = ss.getSheets();

    // Get the global (changing) variables from globals.gs
    // Right now there is only one property on this object, but I'm leaving it like this to make it easy to add stuff in the future
    var globals = getPermissionsVariables();

    // Get the dates saved in the Variables Sheet.  Dates should be for each Friday in the Semester.
    var variablesSheet = ss.getSheetByName('Variables');
    var fridays = variablesSheet.getRange('semesterFridays').getValues();

    // Get Editors emails from globals.gs
    var editors = globals.editors;
    var currentWeek;
    var futureWeeks = [];
    var oneWeek = 700000000;
    var twoWeeks = 1213300000;

    //  Filter the sheets down to just the weeks
    //  Each sheet object will have the sheet, sheetname, that week's Friday's date, and the index of that sheet in the spreadsheet
    //  If it's not a week sheet, lock it
    var sheetObjects = sheets.reduce(function (acc, sheet, index) {
        var sheetName = sheet.getSheetName();
        if (sheetName.split(' ')[0] === 'Week') {
            var sheetObj = {
                sheet: sheet,
                name: sheetName,
                date: new Date(fridays[sheetName.split(' ')[1]]),
                index: parseInt(sheetName.split(' ')[1])
            };
            acc.push(sheetObj);
        } else {
            var protection = sheet.protect();
            lockSheet(protection);
        }
        return acc;
    }, []);

    // Put the sheet objects in order. (Week 1, Week 2, Week 3, etc...)
    sheetObjects.sort(function (a, b) {
        return a.index - b.index;
    });

    // Lock all sheets except the two weeks following the current week
    sheetObjects.forEach(function (sheetObj, index) {
        var protection = sheetObj.sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];

        //  Find the current week's object, and lock it
        if (!currentWeek && sheetObj.date - today > 0 && sheetObj.date - today <= oneWeek) {
            currentWeek = sheetObj;
            var protection_1 = sheetObj.sheet.protect();
            lockSheet(protection_1);
        }

        //  Unlock the next two weeks 
        //  If the current week exists, and the current iteration is less than 2 weeks away from now, unlock the sheet
        else if (currentWeek && sheetObj.date - currentWeek.date <= twoWeeks) {
            // unlock it
            if (protection && protection.canEdit()) {
                protection.remove();
            }
        }


        // If the currentWeek hasn't been defined, and the iteration is not this week, lock the sheet.
        // Will only run if the sheet is not already locked.  It runs much faster because it doesn't have to run through all the sheets every time.
        else if (!protection) {
            // lock it if unlocked
            var protection_2 = sheetObj.sheet.protect();
            lockSheet(protection_2);
        }
    });
    orderSheets(sheetObjects);

    /**
     * Lock sheet, and add correct editors
     * 
     * @param {Object} elToLock Protections Object: Set through `${Sheet}.protect()`
     */
    function lockSheet(elToLock) {
        elToLock.removeEditors(elToLock.getEditors());
        if (elToLock.canDomainEdit()) {
            elToLock.setDomainEdit(false);
        }
        elToLock.addEditors(editors); //Gives editing permission
    }
}