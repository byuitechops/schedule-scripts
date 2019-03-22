# Schedule Scripts

## Purpose

**Describe the reason why this child module exists, and its goals. Provide *why* it exists, along with *what* it does. Briefly describe *how* it does it.**
We have a team schedule to make sure we have open computers for each person when they're here. When changes are made to the schedule, they have to be copied to every week of the semester, which is a very tedious task. These scripts were originally made to do that.  As time has gone by, more functionality has been built into it.  


## How to Run

**Provide any commands used to run the tool. If it is meant to be used as a dependency, include how to call it in their code. See the following examples:**


**Make sure to explain any inputs shown above in the section below.**

### Inputs

Describe each input for the tool. Include **where** that input comes from (i.e. a person, the person running the tool, etc.).




## Requirements

**List all of the business requirements for the project. What are the expectations for the project? What does it need to be able to do? Example:**

- Copy the formats from Week 1 to all other sheets
- Copy all formulas from Week 2 to the other sheets
- Set the protection for each sheet.  Should unlock two weeks at a time.
- Order sheets so the current week shows up first.
- Set the date formulas on all sheets.
- Set a template schedule and copy it onto all weeks.

## Development

### Execution Process
- The function to set protections for all sheets is run on a trigger
    - Go to 'Edit' then 'Current Project's Triggers' to manage and set triggers
    - Trigger should be set for each Friday at 5:00pm

- The functions to Add and Remove Columns, and to set the schedule based on the template are run from a menu option on the sheet itself.
- All other functions are run manually from the Apps Script page. 
    - To get to that page go to 'Tools' then 'Script Editor'.


### Unit Tests - NEED
- None for now, but that is something that needs added

## Functions

### [Permissions.gs](#Permissions)
<dl>
<dt><a href="#setPermissions">setPermissions()</a></dt>
<dd><p>Set the permissions for each sheet</p>
</dd>
</dl>

### [Format.gs](#Format)
<dl>
<dt><a href="#orderSheets">orderSheets(sheetObjects)</a></dt>
<dd><p>Put the sheets in order, starting at the current week</p>
</dd>
<dt><a href="#formatWeeks">formatWeeks()</a></dt>
<dd><p>Format all 'Weeks' sheets to match 'Week 1'</p>
</dd>
<dt><a href="#dataValidation">dataValidation(sheet)</a></dt>
<dd><p>Internal function inside formatWeeks</p>
<dd><p>Set the data-validation rules for the editable cells</p>
</dd>
<dt><a href="#copyOrPasteData">copyOrPasteData(sheet, listRange, action, values)</a></dt>
<dd><p>Internal function inside formatWeeks</p>
<dd><p>Copy the schedule values, and paste them back in</p>
</dd>
<dt><a href="#setDates">setDates()</a></dt>
<dd><p>Create and set the date function for each day of each week</p>
</dd>
<dt><a href="#clearSchedule">clearSchedule()</a></dt>
<dd><p>Remove the schedule values for each week</p>
</dd>
</dl>

### [menuItems.gs](#menuItems)
<dl>
<dt><a href="#convertColumntoNumber">convertColumntoNumber(input)</a></dt>
<dd><p>Input column letter (a, b, c, etc...) and converts it to a number</p>
</dd>
<dt><a href="#addColumnOnAllSheets">addColumnOnAllSheets()</a></dt>
<dd><p>Add a column on all sheets</p>
</dd>
<dt><a href="#removeColumnOnAllSheets">removeColumnOnAllSheets()</a></dt>
<dd><p>Remove a column on all sheets</p>
</dd>
<dt><a href="#onOpen">onOpen()</a></dt>
<dd><p>Create the menu item and dropdown when the sheet opens</p>
</dd>
</dl>

### [template.gs](#template)
<dl>
<dt><a href="#setTemplate">setTemplate()</a></dt>
<dd><p>Copy the schedule from Week 2 onto the template sheet</p>
</dd>
<dt><a href="#setWeeksFromTemplate">setWeeksFromTemplate()</a></dt>
<dd><p>Copy the template schedule to the other sheets</p>
</dd>
</dl>

### [globals.gs](globals)
<dl>
<dt><a href="#cellsToEdit">cellsToEdit()</a></dt>
<dd><p>Get the cells where you input the schedule</p>
</dd>
<dt><a href="#getPermissionsVariables">getPermissionsVariables()</a></dt>
<dd><p>Get the variables that change for 'permissions.gs'</p>
</dd>
<dt><a href="#getFormatVariables">getFormatVariables()</a></dt>
<dd><p>Get the variables that change for 'format.gs'</p>
</dd>
<dt><a href="#getTemplateVariables">getTemplateVariables()</a></dt>
<dd><p>Get the variables that change for 'template.gs'</p>
</dd>
</dl>


<a name="setPermissions"></a>

## setPermissions()
Sets the permissions for each week.  
It checks the date of each week compared to the current week to set the permissions and order of the sheets.

<a name="orderSheets"></a>

## orderSheets(sheetObjects)
Put the weeks in the correct order with the current week first. 
Called from setPermissions()

| Param | Type | Description |
| --- | --- | --- |
| sheetObjects | <code>Object[]</code> | An array of Objects for each sheet.  <code>sheet = {sheet: The actual sheet, name: Sheet name, date: The Friday for the specified week, index: The index of the week (Week 1 = 0, Week 2 = 1, Week 3 = 2, etc...)}</code> |

<a name="formatWeeks"></a>

## formatWeeks()
Copies the format from Week 1 to the rest of the sheets
Also copies the formulas from Week 2 to the rest of the sheets

<a name="dataValidation"></a>

## dataValidation(sheet)
Internal to formatWeeks
Sets the data validation rules for Week 1, which get copied to the rest
Data validation rules are set from the list of names in the 'Variables' sheet

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | The Sheet where data validation will be set. Should only ever be Week 1 |

<a name="setDates"></a>

## setDates()
Set the date formulas for each day of each week. 

<a name="clearSchedule"></a>

## clearSchedule()
Clears all values from the schedule portion of the sheets

<a name="copyOrPasteData"></a>

## copyOrPasteData(sheet, listRange, action, values)
If `action === 'copy'` It will copy and return the schedule data for the sheet
if `action === 'paste'` It will take the data in `values` and paste it to the sheet

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | The sheet where the action will be performed |
| listRange | <code>ListRange</code> | The ranges that contain the schedule information.  It's an array of Ranges where the values are copied from and pasted |
| action | <code>String</code> | `copy` or `paste` Defines the action to take |
| values | <code>Object[]</code> | The values of the schedules |



<a name="convertColumntoNumber"></a>

## convertColumntoNumber(input)
Take the alphabetical value of a column and convert it to a column number 

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | The alphabetical value of a column |


<a name="addColumnOnAllSheets"></a>

## addColumnOnAllSheets()
Adds a column or several columns to all the sheets.
It will prompt where to add the column, and how many columns to add.

<a name="removeColumnOnAllSheets"></a>

## removeColumnOnAllSheets()
Remove a column or several columns from all the sheets
Prompts for where to remove the columns, and how many columns to remove.


<a name="onOpen"></a>

## onOpen()
Creates the custom menu item, and adds it to the sheet

<a name="setTemplate"></a>

## setTemplate()
Sets the template from the Week 2 sheet
Only edits the schedule ranges

<a name="setWeeksFromTemplate"></a>

## setWeeksFromTemplate()
Sets the week schedules from the template
It will ask you which sheet to start with. 

<a name="process"></a>

## cellsToEdit()
The cell ranges that are going to be used across multiple sheets

<a name="getPermissionsVariables"></a>

## getPermissionsVariables()
The variables that could change for just `Permissions.gs`
Currently only contains a list of emails of people that can edit the entire spreadsheet

<a name="getFormatVariables"></a>

## getFormatVariables()
The variables that could change for just `format.gs`

<a name="getTemplateVariables"></a>

## getTemplateVariables()
The variables that could change for just `template.gs`