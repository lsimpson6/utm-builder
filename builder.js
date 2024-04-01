(function () {

    try {
        document.querySelectorAll('.close-old-utm-modal').forEach(btn => btn.addEventListener('click', () => {
            document.getElementById('testNewBuilderModal').classList.replace('d-flex', 'd-none');
        }))
    } catch (e) {

    }

    var table = document.getElementById('utm-list');
    var actionButtons = document.querySelectorAll('.btn-actions');
    var checkboxes = document.getElementsByName('rowcheckbox');

    // builds html table
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.querySelector('#loading-screen .text p').textContent = "Building table";
        }, 400);
        buildTable();
        alterFieldClasses(true);
    })

    // inital function to update duplicate classes
    function alterFieldClasses(firstBuild) {
        if (firstBuild) {
            setTimeout(() => {
                document.querySelector('#loading-screen .text p').textContent = "Building fields";
            }, 800);
        }

        document.querySelectorAll('.form-control').forEach(input => {
            if ($(input).hasClass('tt-hint')) {
                input.classList.remove('parameter');
                if ($(input).hasClass('re-required')) {
                    input.classList.remove('re-required');
                }
            }
        })

        if (firstBuild) {
            setTimeout(() => {
                document.querySelector('#loading-screen .text p').textContent = "Finishing set up";
            }, 1200);

            setTimeout(() => {
                document.querySelector('#loading-screen .text p').textContent = "Done!";
                document.querySelector('#loading-screen .spinning').classList.remove('load-spin');
                document.querySelector('#loading-screen .spinning').style = "border: 2px solid white; width: 30px; height: 30px; border-radius: 50%;";
                document.querySelector('#loading-screen .spinning p').style = "opacity: 1;";
            }, 1600);

            setTimeout(() => {
                redirectConformation('','redirect');
                redirectConformation('','utm');
                document.getElementById('loading-screen').classList.add('d-none');
            }, 2000);
        }
    }

    function reset() {
        insertReFields();

        initializeTypeahead('fund', fundOptions);
        initializeTypeahead('campaign', campaignOptions);
        initializeTypeahead('appeal', appealOptions);
        initializeTypeahead('subtype', subtypeOptions);

        alterFieldClasses(false);
    }

    function insertReFields() {
        var re = document.getElementById('reparams-fields');

        re.innerHTML = "<fieldset class='d-flex flex-row param-forms title-target' data-column-name='campaign'><label asp-for='CampaignId'>Campaign ID<span class='required' >*</span ></label ><input value='' asp-for='CampaignId' type='text' class='parameter re form-control re-required medium campaign-typeahead typeahead'/></fieldset><fieldset class='d-flex flex-row param-forms title-target' data-column-name='fund'><label asp-for='FundId'>Fund ID<span class='required'>*</span></label><input value='' asp-for='FundId' type='text' class='parameter re re-required form-control medium fund-typeahead typeahead'/></fieldset><fieldset class='d-flex flex-row param-forms title-target' data-column-name='appeal'><label asp-for='AppealId'>Appeal ID<span class='required'>*</span></label><input value='' id='AppealId' asp-for='AppealId' type='text' class='parameter re re-required form-control medium appeal-typeahead typeahead' /></fieldset><fieldset class='d-flex flex-row param-forms title-target' data-column-name='Package'><label asp-for='PackageId'>Package ID</label><select value='' class='parameter form-control re' id='PackageId' name='PackageId'></select></fieldset><fieldset class='d-flex flex-row param-forms title-target' data-column-name='subtype'><label asp-for='Subtype'>Gift Subtype<span class='required'>*</span></label><input value='' asp-for='Subtype' type='text' class='parameter re re-required form-control medium subtype-typeahead typeahead' /></fieldset><fieldset class='d-flex flex-row param-forms title-target' data-column-name='event'><label asp-for='EventId'>Orchard Event ID</label><input value='' asp-for='EventId' type='text' class='parameter re form-control medium' /></fieldset>";
    }

    // builds initial table with no content
    // this just builds the table header
    function buildTable() {

        try {
            // declare variables
            var tableHead = document.getElementById('utm-head');
            var tableNames = document.querySelectorAll('.title-target');
            var tRow = tableHead.insertRow(0);

            // inserts empty space in checkbox column
            tRow.insertCell(0).innerHTML = "&nbsp;";

            // loops through each input box
            for (let i = 0; i < tableNames.length; i++) {
                // gets column name attribute of box
                let cName = tableNames[i].getAttribute('data-column-name');
                let cIndex = i + 1;
                // sets row attribute text to cell name 
                tRow.insertCell(cIndex).innerHTML = cName;
            }

            return true;
        } catch (e) {
            return false;
        }
    }


    //button event listeners
    actionButtons.forEach(btn => btn.addEventListener('click', () => {
        let action = btn.getAttribute('data-utm-action');
        showHideFields(true, true, true);
        let frmValues = document.querySelectorAll('.parameter');
        let allRows = document.querySelectorAll('#utm-list tr');


        if (action != 'review-utm-toggle') {
            openCloseReviewTab('close');
        }
        switch (action) {
            // opens model for new utm
            case "new-utm":
                getSetDeValuesFromFields('get');
                reset();
                getSetDeValuesFromFields('set');
                showHideFields(true, false, true);
                break;
            case "new-redirect":
                showHideFields(false, true, true);
                break;
            // opens model to update selected utms
            case "update-selected":
                validateUpdateChecked();
                break;
            // once modal is open, this button makes the new utm
            case "add-new":
                getSetFormValues();
                showHideFields(true, false, true);
                break;
            // once modal is open, this button updates all selected utm's and clears the form
            case "update-utm":
                showHideFields(true, false, false);
                // loops through each value
                for (let p = 0; p < frmValues.length; p++) {
                    // if value is null or empty, ignore it
                    if (frmValues[p].value != "") {
                        let i = p + 1;
                        // if not empty, pass it as param to updateChecked
                        updateChecked(i);
                    }
                }
                break;
            // opens right review pannel to view url and utms
            case "review-utm-toggle":
                if (allRows.length > 0) {
                    writeToReviewTable();
                    openCloseReviewTab();
                } else {
                    popupMessage("There are no rows to review & publish.", "red");
                }
                break;
            // clears entire table
            case "clear-all":
                if (allRows.length > 0) {
                    if (confirm('Are you sure you want to delete the table?')) {
                        allRows.forEach(row => {
                            table.deleteRow(row);
                        });
                        popupMessage("All rows deleted.", "green");
                    }

                } else {
                    popupMessage("There are no rows to delete.", "red");
                }

                break;
            // deletes the selected rows from the table
            case "delete-selected":
                let numbersChecked = checkedCount();
                // makes sure there are rows to delete
                if (checkboxes.length > 0) {
                    for (let r = checkboxes.length - 1; r > -1; r--) {
                        // loops through each row to get checked ones
                        if (checkboxes[r].checked) {
                            // deletes checked row
                            table.deleteRow(r);
                        }
                    }
                    // alert box notifictions
                    if (numbersChecked > 0) {
                        popupMessage("Selected rows deleted.", "green");
                    } else {
                        popupMessage("There are no rows selected to delete.", "red");
                    }

                } else {
                    // if there are no rows on the table
                    popupMessage("There are no rows to delete.", "red");
                }
                break;
            // button publish event handler
            case "publish-all-utms":
                SubmitUtms();
                break;
            // toggle buttons for the new/update functions
            case "add-new-redirect":
                validatePlainRedirects();
                break;
        }

    }))

    document.getElementById('close-review-tab').addEventListener('click', ()=>{
        openCloseReviewTab();
    })

    document.getElementById('reparams-toggle').addEventListener('click', () => {
        expandCollapseFields('reparams-fields', 'gaparams-fields');
    })

    document.getElementById('gaparams-toggle').addEventListener('click', () => {
        expandCollapseFields('gaparams-fields', 'reparams-fields');
    })

    function showHideFields(isUtm, showHide, addingNew) {

            // hides / shows popup box
            if (isUtm) {
                if (addingNew) {
                    document.getElementById('utm-action-text').textContent = "Create New UTM";
                    actionButtons.forEach(b => {
                        if (b.getAttribute('data-utm-action') == "add-new") {
                            b.classList.remove('d-none');
                        } else if (b.getAttribute('data-utm-action') == "update-utm") {
                            b.classList.add('d-none');
                        }
                    })
                } else {
                    document.getElementById('utm-action-text').textContent = "Update UTM";
                    actionButtons.forEach(b => {
                        if (b.getAttribute('data-utm-action') == "add-new") {
                            b.classList.add('d-none');
                        } else if (b.getAttribute('data-utm-action') == "update-utm") {
                            b.classList.remove('d-none');
                        }
                    })
                }
                document.getElementById('utm-fields').setAttribute('data-hidden', showHide);
            } else {
                if (addingNew) {
                    document.getElementById('create-redirect-title').textContent = "Create New Redirect";
                    actionButtons.forEach(b => {
                        if (b.getAttribute('data-utm-action') == "add-new-redirect") {
                            b.classList.remove('d-none');
                        } else if (b.getAttribute('data-utm-action') == "update-redirect") {
                            b.classList.add('d-none');
                        }
                    })
                } else {
                    document.getElementById('create-redirect-title').textContent = "Update Redirect";
                    actionButtons.forEach(b => {
                        if (b.getAttribute('data-utm-action') == "add-new-redirect") {
                            b.classList.add('d-none');
                        } else if (b.getAttribute('data-utm-action') == "update-redirect") {
                            b.classList.remove('d-none');
                        }
                    })
                }
                document.getElementById('redirect-fields').setAttribute('data-hidden', showHide);
            }

    }
   
    // expands and collapses the fields for input, RE and GA 
    function expandCollapseFields(show, hide) {
        // sets fields object
        let fields = {
            "reparams-fields": { h3: '#reparams-toggle h3', p: '#reparams-toggle p', attr: 'data-reparams', sim: 'no' },
            "gaparams-fields": { h3: '#gaparams-toggle h3', p: '#gaparams-toggle p', attr: 'data-gaparams', sim: 'no' },
        }

        var attrSelectorShow = document.getElementById(show);
        var attrSelectorHide = document.getElementById(hide);

        var h3Hide = document.querySelector(fields[hide].h3);
        var h3Show = document.querySelector(fields[show].h3);

        // gets field objects based on params passed through
        if (attrSelectorShow.getAttribute(fields[show].attr) == 'visible') {
            attrSelectorShow.setAttribute(fields[show].attr, 'hidden');
            attrSelectorHide.setAttribute(fields[hide].attr, 'visible');

            h3Hide.textContent = '-';
            h3Show.textContent = '+';
        } else {
            attrSelectorShow.setAttribute(fields[show].attr, 'visible');
            attrSelectorHide.setAttribute(fields[hide].attr, 'hidden');

            h3Hide.textContent = '+';
            h3Show.textContent = '-';
        }

    }

    // button update function
    function resetTableForUpdate(numberChecked, type) {
        // check if any checkboxes are checked

        let table = document.getElementById('utm-list');
        let tableRows = document.querySelectorAll('#utm-list tr');
        let date = new Date;

        if (checkboxes.length > 0) {
            //get number of checkboxes checked
            // if there are checkboxes checked then display box and allow update
            if (numberChecked > 0) {
                // changes text within fields box
                document.getElementById('utm-action-text').textContent = "Update Selected UTM's";
                // hides / shows button add and updated button based on users selected actions 
                actionButtons.forEach(b => {
                    if (b.getAttribute('data-utm-action') == "add-new" && !$(b).hasClass('d-none')) {
                        b.classList.add('d-none');
                    } else if (b.getAttribute('data-utm-action') == "update-utm" && $(b).hasClass('d-none')) {
                        b.classList.remove('d-none');
                    }
                })

                if (type == "utm") {
                    // get all paramater values (v)
                    document.querySelectorAll('.parameter').forEach(v => {
                        // clear form for updated if is not RE specific
                        if (!($(v).hasClass('re'))) {
                            if (v.getAttribute('name') == "Year") {
                                v.value = date.getFullYear();
                            } else {
                                v.value = "";

                            }
                        }
                        // clear styles

                        v.style = "";
                    })
                    // gets the sub param values , ex: state name and branch name
                    document.querySelectorAll('.sub-parameter').forEach(sub => {
                        // clears values
                        sub.value = '';
                    })
                }
                
            } else {
                popupMessage("There are no rows selected to update.", "red");

            }
        } else {
            popupMessage("There are no rows to update.", "red");
        }

        reset();
    }

    // gets number of rows checked
    function checkedCount(num) {
        num = 0;
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                num++;
            }
        }
        return num;
    }

    // event listener for closing the add / update contianer
    document.getElementById('close-fields').addEventListener('click', () => {
        showHideFields(true, true, true);
    })

    document.getElementById('close-redirect-field').addEventListener('click', () => {
        showHideFields(false, true, true);
    })

    document.getElementById('new-redirect-btn').addEventListener('click', () => {
        showHideFields(false, false, true);
        openCloseReviewTab('close');
    })

    function validateUpdateChecked() {
        let num = 0;
        let types = [];
        let table = document.querySelector('#utm-list');
        reset();

        for (let cbi = 0; cbi < checkboxes.length; cbi++) {
            if (checkboxes[cbi].checked) {
                if (table.rows[cbi].getAttribute('data-parameter') == "redirect") {
                    types.push('redirect');
                } else {
                    types.push('utm');
                }
                num++;
            }
        }
  
        let isOnlyOneType = true;
        for (let t1 = 0; t1 < types.length; t1++) {
            for (let t2 = t1 + 1; t2 < types.length; t2++) {
                if (types[t1] != types[t2]) {
                    isOnlyOneType = false;
                }
                console.log('type 1: ' + types[t1] + ' type 2: ' + types[t2]);
            }
        }
        if (isOnlyOneType) {
            if (types[0] === "utm") {
                showHideFields(true, false, false);
            } else if (types[0] === "redirect") {
                let fields = document.querySelectorAll('.redirect');

                if (types.length > 0) {
                    fields.forEach(field => {
                        field.style = "";
                        field.value = "";
                    })
                }
                showHideFields(false, false, false);
            }
            console.log(types[0]);
            resetTableForUpdate(num, types[0]);
        } else {
            popupMessage('You are trying to update a Redirect and a UTM, please only choose one type at a time.', 'red');
        }
    }

    // 
    function updateChecked(cellIndex) {
        // get all the checked rows
        for (let ch = 0; ch < checkboxes.length; ch++) {
            // checks if rows are chcked
            if (checkboxes[ch].checked) {
                // passed the element and index to method to set form values
                getSetFormValues(ch, cellIndex, true);
            }
        }
    }

    // gets and sets the form values for adding new UTM and updating a UTM
    function getSetFormValues(rowToUpdate, cellIndex, updatingTable) {
        // declaring variables
        var frmValues = document.querySelectorAll('.parameter');
        var row;
        var length = frmValues.length;
        var startingLoopVal = 0;
        var fieldsAreValid = true;
        var fieldType = null;

        // if being created as new row / NOT being updated
        // form validation for required fields
        // if the user is adding a new UTM and NOT UPDATING
        if (!updatingTable) {
            let subValsEmpty = 0;
            let sub = document.querySelectorAll('.sub-parameter');
            // loop through each input box
            frmValues.forEach(v => {
                v.style = "border-color: inherit;";
                let req = v.getAttribute('data-required');
                // checks if the values is required and not null or empty
                if (req == "true" && v.value == "" || v.value == null) {
                    // set fields to invalid
                    fieldsAreValid = false;
                    popupMessage("One or more required fields are required.", 'red', v);
                    // NOT SURE WHAT THIS DOES, MIGHT NOT BE NEEDED
                    if (document.getElementById('gaparams-fields').getAttribute('data-gaparams') == 'hidden') {
                        expandCollapseFields('gaparams-fields', '#gaparams-toggle h3', 'data-gaparams', 'simulate');
                    }
                    subValsEmpty++;

                }

                // the program-list is specific to the GA programs, this is set up to require DE fields if a fundraising program is selected
                // checks if the input is for ga program 
                if ($(v).hasClass('program-list')) {
                    // get's all the options within the program list
                    document.querySelectorAll('.program-list option').forEach(option => {
                        // if the value is fundraising (set in the program taxonomy as T || F) then require DE fields
                        if (v.value == option.value && option.getAttribute('data-is-fundraising') == "True") {
                            // get's all RE/DE fields that are required (appeal, fund, campaign)
                            let reRequiredFields = document.querySelectorAll('.re-required');
                            reRequiredFields.forEach(re => {
                                // if required DE field is empty or null then...
                                if (re.value == null || re.value == "") {
                                    // set fields are valid false
                                    fieldsAreValid = false;
                                    fieldType = 'fundraising';
                                    popupMessage('Fundraising specific programs require fundraising parameters.', 'red', re);
                                    // ALSO NOT SURE WHAT THIS DOES, MIGHT NOT NEED IT
                                    if (document.getElementById('reparams-fields').getAttribute('data-reparams') == 'hidden') {
                                        expandCollapseFields('reparams-fields', '#reparams-toggle h3', 'data-reparams', 'simulate');
                                    }
                                    subValsEmpty++;
                                }
                            })
                        }
                    })
                }

                // checks if the location is state or branch to display specifc options
                if (v.value == "State" || v.value == "Branch") {
                    // loops through each sub value (state names or branch names)
                    sub.forEach(sv => {
                        // resets border color
                        sv.style = "border-color: inherit;";
                        // declaires sub child / sub params variables
                        let subReq = sv.getAttribute('data-required');
                        let subChild = sv.getAttribute('data-param-relationship');

                        // if value is required and location is branch
                        if (subReq == "true" && subChild == "child-branch") {
                            // checks if branch value is empty
                            if (sv.value == null || sv.value == "") {
                                // if empty, set fields to invalid
                                fieldsAreValid = false;
                                popupMessage("One of more required fields are empty.", 'red', sv);
                                expandCollapseFields('gaparams-fields', '#gaparams-toggle h3', 'data-gaparams', 'simulate');
                            }
                            // checks if value is required and location is state
                        } else if (subReq == "true" && subChild == "child-state") {
                            // checks if state value is empty or null
                            if (sv.value == null || sv.value == "") {
                                // set fields to invalid
                                fieldsAreValid = false;
                                popupMessage("One or more required fields are required.", 'red', sv);
                                expandCollapseFields('gaparams-fields', '#gaparams-toggle h3', 'data-gaparams', 'simulate');
                            }
                        }
                    })
                }
            })

            // checks if all fields are valid
            if (fieldsAreValid) {
                // builds first table row and adds checkbox to the row
                let chk = "<input name='rowcheckbox' type='checkbox'/>";
                row = table.insertRow(0);
                //inserts checkbox html
                row.insertCell(0).innerHTML = chk;
            }
        } else {
            // if user is updating table, ignore all logic prior to this else statement
            row = table.rows[rowToUpdate];
        }

        // checks if fields are valid OR if the user is updating a table
        // fields have already been validated at this point so both actions and use this same method
        if (fieldsAreValid || updatingTable) {
            // get each value & adds to table
            for (let i = startingLoopVal; i < length; i++) {
                var cIndex = i + 1;
                var values = frmValues[i].value;

                // keeping this in case I need to add it back.
                //trim subtype if is a number
                //if (frmValues[i].getAttribute('asp-for') == 'Subtype') {
                //    let subtypeValue = values.substring(0, values.indexOf(' '));
                //    if (!isNaN(subtypeValue)) {
                //        values = subtypeValue;
                //    }
                //}
                // if location is branch or state, call method to get specific value
                if (frmValues[i].getAttribute('data-param-relationship') == "parent-branch-state" && values == "Branch" || values == "State") {
                    // sets value for specific field to the returned value
                    values = getSetSpecificLocation();
                }

                // trims ending spaces
                values = values.trimEnd();
                // if updating table
                if (cellIndex == cIndex && updatingTable) {
                    // sets values where fields are not empty equal to table values
                    row.cells[cIndex].innerHTML = values;
                    popupMessage("UTM(s) Updated!", "green");
                }
                // if not updating table / if adding new
                else if (!updatingTable) {
                    // array of paramameters starting vlaues

                    let paramatersArr = ["baseurl", "tourl", "campaign=", "fund=", "appeal=", "package=", "subtype=", "event=", "utm_campaign1", "utm_campaign2", "utm_campaign3", "utm_campaign4", "utm_source=", "utm_medium=", "utm_content="];
                    // campaign=value&
                    // checks if custom url is empty
                    if (frmValues[i].value == '' && frmValues[i].getAttribute('data-tourl') == 'True') {
                        // auto generates random 6 character string if value is empty
                        values = autoGenerateUrl();
                    }
                    // inserts values into table row
                    row.insertCell(cIndex).innerHTML = values;
                    // sets paramater starting values as a param to the table fields
                    row.cells[cIndex].setAttribute('data-parameter', paramatersArr[i]);
                    popupMessage('New UTM added!', "green");
                }
            }
        } else if (fieldType == null) {
            getSetDeValuesFromFields('get');
            reset();
            getSetDeValuesFromFields('set');
            popupMessage("One or more required fields are empty.", "red")
        }
        getSetDeValuesFromFields('get');
        reset();
        getSetDeValuesFromFields('set');
    }

    var values = [];
    var indexes = [];

    function getSetDeValuesFromFields(action) {

        let fields = document.querySelectorAll('.parameter');
        if (action == 'get') {
            values = [];
            indexes = [];
            for (let f = 0; f < fields.length; f++) {
                if ($(fields[f]).hasClass('re')) {
                    values.push(fields[f].value);
                    indexes.push(f);
                }
            }
        } else if (action == 'set') {
            for (let x = 0; x < indexes.length; x++) {
                let tmpI = indexes[x];
                fields[tmpI].textContent = values[x];
                fields[tmpI].value = values[x];
            }
        }
    }

    // method to auto generate random URL
    function autoGenerateUrl(random) {
        const letters = "ABDCEFGHIJKLMNOPQRSTUVWXYZ";
        random = '';
        for (let l = 1; l < 9; l++) {
            let singleLetter = letters[Math.floor(Math.random() * letters.length)];
            random += singleLetter;
        }
        return random;
    }

    //function to get state or branch name also refered to as child value
    function getSetSpecificLocation(childValue) {

        // declaring variables
        let child = document.querySelectorAll('.sub-parameter');
        let parent = document.querySelectorAll('.parameter');
        var parentValue;

        // loops through each input
        parent.forEach(p => {
            // only gets inputs where the input is location 
            if (p.getAttribute('data-param-relationship') == 'parent-branch-state') {
                // get's parent value (state / branch)
                parentValue = p.value;
            }
        })

        // switch the parent value
        switch (parentValue) {
            case "Branch":
                // loop through each child
                child.forEach(c => {
                    // if child is branch
                    if (c.getAttribute('data-param-relationship') == "child-branch") {
                        // get branch value
                        childValue = c.value;
                        // set branch field to required
                        c.setAttribute('data-required', "true");
                    } else {
                        // set to not required if the parent location is not branch
                        // will throw an error if required
                        c.setAttribute('data-required', "false");
                    }
                })
                break;

            case "State":
                // loop through each child
                child.forEach(c => {
                    // if child is state
                    if (c.getAttribute('data-param-relationship') == "child-state") {
                        // get state value
                        childValue = c.value;
                        // set state field to required
                        c.setAttribute('data-required', "true");
                    } else {
                        // set to not required if the parent location is not state
                        // will throw an error if required
                        c.setAttribute('data-required', "false");
                    }
                })
            break;
        };

        // return the value of the child location (branch or state)
        return childValue;

    }

    // builds and writes review table
    // this table is built with JS, only the header is declared in HTML
    function writeToReviewTable() {
        // declare variables
        var numOfRows = document.querySelectorAll('#utm-list tr');
        var numOfCellsPerRow = document.querySelectorAll('#utm-head tr td').length
        var listTable = document.getElementById('utm-list');
        var rTable = document.getElementById('review-body');
        // this is the svg code for a the status checkbox
        var status = "<div class=' m-auto d-flex align-items-center text-center status-col' style='opacity: 0;border-radius: 50%; width: 30px; height: 30px; border-left: 1px solid black; border-top: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid transparent;'><p class='m-auto' style='color: #fff;'>✓</p></div>";
        try {
            // loop through each row of the main utm table 
            for (let r = 0; r < numOfRows.length; r++) {

                var rCell = rTable.insertRow(r);

                // insert first cell of review table to be the same as 2nd cell of main table
                // this is the main url (from URL)
                rCell.insertCell(0).innerHTML = listTable.rows[r].cells[1].innerHTML;
                // insert 2nd cell of review table to be the same as 3nd cell of main table
                // this is the custom url (from url)
                rCell.insertCell(1).innerHTML = listTable.rows[r].cells[2].innerHTML;

                let string = "";
                var utmArr = [];
                // get each row in the main table
                var tr = listTable.rows[r];

                // loops through each cell in the main table starting after index 3
                // index 0 = checkbox, 1 = full url, 2 = from/custom url
                if (tr.getAttribute('data-parameter') != 'redirect') {
                    for (var c = 3; c < numOfCellsPerRow; c++) {
                        // gets cell value of the cell within the active row
                        var tmpCell = encodeURIComponent(tr.cells[c].textContent);
                        // if the cell in the main table is not empty
                        if (tmpCell != "") {
                            var tmpParam = tr.cells[c].getAttribute('data-parameter');
                            // checks if there cell in the table is a param for the utm_campaign value
                            if (tmpParam.includes("utm_campaign")) {
                                if (tmpParam.includes('1')) {
                                    utmArr.push("utm_campaign=" + tmpCell);
                                } else if (tmpParam.includes('4')) {
                                    utmArr.push("_" + tmpCell + '&');
                                }
                                else {
                                    utmArr.push("_" + tmpCell);
                                }
                            }
                            else {
                                // push parameter from attribute + parameter value to utmArr
                                utmArr.push(tmpParam + tmpCell + '&');
                            }
                        }
                    }
                    // loop through all of the values in the utmArr
                    for (let u = 0; u < utmArr.length; u++) {
                        let tempUtm = utmArr[u];
                        // add each value in the array to a single string
                        string += tempUtm;
                    }

                    // trims characters from string 
                    if (string.indexOf('&', string.length) || string.indexOf('%', string.length) || string.indexOf(' ', string.length)) {
                        string = string.substring(0, string.length - 1);
                    }

                    // inserts cell 3 of the review table (utm url) equal to the string built from the utmArr
                    rCell.insertCell(2).innerHTML = tr.cells[1].innerHTML + "?" + string;

                } else {
                    // inserts cell 3 of the review table (utm url) equal to the string built from the utmArr
                    rCell.insertCell(2).innerHTML = tr.cells[1].innerHTML;
                }

                // inserts svg code for the status
                rCell.insertCell(3).innerHTML = status;
            }


            // after done creating table, publish automatically
            document.querySelectorAll('.status-col').forEach(status => {
                $(status).toggleClass('load-spin');
            })
            // declare variables
            var reviewTableCells = document.querySelectorAll('#review-body tr td');
            var reviewTable = document.querySelector('#review-body');
            var reviewTableRows = document.querySelectorAll('#review-body tr');
            let mainTable = document.getElementById('utm-list');
            var promises = [];

            // for each row in the review table
            for (var r = 0; r < reviewTableRows.length; r++) {
                let tmpNum = 0;
                // get's the row
                var tRow = reviewTable.rows[r];
                // checks if first cell is not empty
                if (tRow.cells[1].textContent != '') {
                    tmpNum = 1;
                }
                // hardcode to get the 13th cell (source of utms) from main table
                let src = mainTable.rows[r].cells[13].textContent;
                // pushes to promises
                //tmpNum is either 0 or 1 based on the prior if statement
                // if the review table doesn't have a custom url (index 1), then the value is 0
                promises.push(PublishUtms(tRow.cells[tmpNum].textContent, tRow.cells[2].textContent, r, src));
            }
        } catch (e) {
            console.log('error: ' + e);
        }
    }

    // open close right review tab
    function openCloseReviewTab(close) {
        // declare variables
        var reviewContainer = document.getElementById('review-table');
        var reviewContent = document.getElementById('review-content');
        var rows = document.querySelector('#review-body');
        var child = document.querySelectorAll('#review-body tr');

        // if optional parameter is NOT set to open
        // this is used to just keep the review tab open
        if (close != 'open') {
            // if the tab is open turn off the tab
            if ($(reviewContainer).hasClass('review-on') || close == "close") {
                reviewContainer.classList.replace('review-on', 'review-off');
                reviewContent.classList.add('d-none');
                // delete all the rows when closing
                child.forEach(row => {
                    rows.deleteRow(row);
                })
                document.body.style = 'overflow-y: scroll;';
            }
            else {
                // open / turn on the tab
                showHideFields(true, true, true);
                showHideFields(false, true, true);
                reviewContainer.classList.replace('review-off', 'review-on');
                reviewContent.classList.remove('d-none');
                document.body.style = 'overflow-y: hidden;';
            }
        } else {
            // if the optional param is set to open
            // keep tab open or open it
            reviewContainer.classList.replace('review-off', 'review-on');
            reviewContent.classList.remove('d-none');
            document.body.style = 'overflow-y: hidden;';
        }

    }

    // method for copying the final review table
    document.querySelectorAll('.copy-row').forEach(cr => cr.addEventListener('click', () => {
        let reviewTable = document.getElementById('review-body');
        let tableRow = document.querySelectorAll('#review-body tr');
        var range, copiedTable;
        if (document.createRange && window.getSelection) {
            range = document.createRange();
            copiedTable = window.getSelection();
            copiedTable.removeAllRanges();

            range.selectNodeContents(reviewTable);
            copiedTable.addRange(range);

            navigator.clipboard.writeText(copiedTable);

            popupMessage((tableRow.length) + ' row(s) copied!', 'green');
        }
    }))

    // method for the custom pop up box
    function popupMessage(message, color, fields) {

        var box = document.getElementById('message-box');
        var p = document.querySelector('#message-box p');

        try {
            fields.style = "border-color: red;";
        } catch (e) {
            //do nothing
            // basically I don't always pass through the fields param, so this catches that error if I don't pass it through
        }
        // sets color based on if message is good or bad
        switch (color) {
            case "green":
                color = "#00b388";
                break;
            case "red":
                color = "#CB5858";
                break;
            case "black":
                color = "#000";
                break;
        }

        p.innerHTML = message;
        box.style = 'top: 70px !important;';
        p.style = 'color: ' + color;

        setTimeout(() => {
            box.style = '';
        }, 3500)
    }


    // publish utms with post method
    function PublishUtms(from, to, r, src) {
        //declare variables
        let groupText = document.getElementById('utm-group-name').value;

        let source = ' (' + src + ')';
        // sets displayText to grouping text on review tab and source (src) of the utm
        let group = groupText + source;
        // if the group text field is empty then just set group text to the to url (the one with the utms appended)
        if (groupText == "" || groupText == null) {
            let tmpToUrl = to;
            tmpToUrl = to.substring(0, (to.indexOf('?')));
            group = tmpToUrl + source;
        }



        // declares the object to pass through the .post method
        // group is the group name text for searching in orchard
        // from is the custom or from url
        // to is the url with the utm
        var obj = {
            displayText: group,
            apiKey: api_key,
            customAlias: from,
            toUrl: to
        }


        return new Promise((resolve, reject) => {
            try {
                // sets url for posting vlaues
                let url = 'https://' + window.location.host + '/api/v1/RedirectApi/CreateUtmRedirect';
                // posts url and obj
                $.post(url, obj)
                    .done(function () {
                        // set status checkbox equal to green 
                        utmPublishStatus(r, true);
                    })
                    .fail(function () {
                        // set status checkbox equal to red and display error text
                        utmPublishStatus(r, false);
                    });
                    
            } catch (e) {
                // if something goes wrong aside from post, done or fail this will catch it
                status[r].style = 'fill: #CB5858 !important;';
                document.querySelectorAll('.publish-status path')[r].style = 'stroke: #fff !important;';
                popupMessage('Something went wrong.', 'red');
            }
        })
    }

    var publishedCounter = 0;
    function utmPublishStatus(i, isSuccess) {
        let table = document.getElementById('utm-list');
        let status = document.querySelectorAll('.status-col');
        let statusText = document.querySelectorAll('.status-col p');
        let rowFailed = document.querySelectorAll('#utm-list tr');
        let defaultStyle = 'border-radius: 50%; width: 25px; height: 25px; color: #fff !important;';

        status[i].classList.remove('load-spin');

        if (!isSuccess) {
            status[i].style = 'background-color: #CB5858 !important;' + defaultStyle;
            rowFailed[i].style = 'color:#db8a8a !important;';
            statusText[i].textContent = 'x';
            popupMessage('Duplicate Short URLs', 'red');
            rowFailed[i].setAttribute('data-published', false);
        } else {
            status[i].style = 'background-color: #00b388 !important;' + defaultStyle;
            rowFailed[i].style = '';
            rowFailed[i].setAttribute('data-published', true);
        }

        publishedCounter++;
        console.log(publishedCounter);
        if (publishedCounter == rowFailed.length) {
            afterPublishClearRows(rowFailed, rowFailed.length);
        }
    }

    function afterPublishClearRows(allRows, total) {
        publishedCounter = 0;
        let table = document.querySelector('#utm-list');
        let totalPublished = 0;
        for (let row = allRows.length - 1; row > -1; row--) {
            if (allRows[row].getAttribute('data-published') == "true") {
                table.deleteRow(row);
                totalPublished++;
            }
        }

        popupMessage(totalPublished + '/' + total + ' rows published.', 'black');
    }


    // plain redirect section starts here 
    document.querySelector('#redirect-fields input').addEventListener("input", (e) => {
        redirectConformation(e, 'redirect')
    });

    // plain redirect section starts here
    document.querySelector('#CustomUrl').addEventListener("input", (e) => {
        redirectConformation(e, 'utm')
    });

    function redirectConformation(txt, type) {

        var conformationTextEl = document.getElementById('redirect-custom-url-full-url');
        var input = document.querySelector('#redirect-fields input');
        if (type != 'redirect') {
            conformationTextEl = document.getElementById('utm-custom-url-full-url');
            input = document.querySelector('#CustomUrl');
        }
        try {
            let val = txt.target.value;
            if (!(/[a-zA-Z]/).test(val.charAt(0))) {
                console.log('invalid due to char');
                popupMessage('Redirect:' + '<br>' + 'This field must start with a letter A-Z.', 'red', input);
                input.setAttribute('data-isvalid', false);
            } else if ((/\s/).test(val)) {
                console.log('invalid due to spaces');
                popupMessage('Redirect:' + '<br>' + 'This field cannot contain spaces. Please use - or /.', 'red', input);
                input.setAttribute('data-isvalid', false);
            } else if ((/.org/g).test(val) || (/.com/g).test(val) || (/.net/g).test(val) || (/.gov/g).test(val)) {
                console.log('invalid due to using .net, .com, .org or similar');
                popupMessage('Redirect:' + '<br>' + 'Field cannot contain .org, .net, or .com', 'red', input);
                input.setAttribute('data-isvalid', false);
            } else {
                input.setAttribute('data-isvalid', true);
                input.style = "";
            }
            var string = window.location.host + "/" + val;
            conformationTextEl.textContent = string;
        } catch (e) {
            var string = window.location.host + "/";
            conformationTextEl.textContent = string;
        }
    }

    function validatePlainRedirects(updating) {
        let inputs = document.querySelectorAll('.redirect');
        var inputsAreValid = true;
        const charAttr = 'data-has-valid-characters';
        const dv = 'data-isvalid';

        inputs.forEach(input => {
            let inVal = input.value;
            console.log('attr has: ' + input.hasAttribute('data-isvalid'));
            console.log('attr get: ' + input.getAttribute('data-isvalid'));

            //if (input.hasAttribute('data-isvalid') == "true" && input.getAttribute('data-isvalid') == "false") {
            //    console.log('has and got');
            //}

            if (input.getAttribute('data-isvalid') == "true") {
                if (inputsAreValid) {
                    if (inVal == null || inVal == "") {
                        inputsAreValid = false;
                        popupMessage('Redirect:' + '<br>' + 'Fields cannot be empty.', 'red', input);
                    }
                    else {
                        console.log('valid');
                        input.setAttribute('data-isvalid', true);
                        input.style = "";
                        inputsAreValid = true;
                    }
                }
            } else {
                inputsAreValid = false;
                popupMessage('Redirect:' + '<br>' + 'Field must start with a letters A-Z and may not contain spaces.', 'red', input);
            }
        })

        if (inputsAreValid && !updating) {
            addRedirectToTable(inputs);
        } else if (inputsAreValid && updating) {
            updateChecked();
        }
    }

    function addRedirectToTable(inputs) {
        let table = document.getElementById('utm-list');
        let tableHeader = document.getElementById('utm-head');
        var row = table.insertRow(0);
        let chk = "<input name='rowcheckbox' type='checkbox'/>";
        //inserts checkbox html
        row.insertCell(0).innerHTML = chk;
        let remaining = 0;
        let v = 1;
        for (let i = inputs.length - 1; i > -1 ; i--) {
            row.insertCell(v).innerHTML = inputs[i].value;
            console.log('cell: ' + v + "value: " + inputs[i].value);
            v++;
            remaining = v;
        }


        for (let r = 1; r < tableHeader.rows[0].cells.length; r++) {
            if (r > inputs.length) {
                row.insertCell(r).innerHTML = 'redirect';
            }
            row.setAttribute('data-parameter', "redirect");
        }
        popupMessage('New Redirect Added!', "green");
    }


    document.getElementById('update-redirect-btn').addEventListener('click', () => {
        updateRedirect();
    })

    function updateRedirect() {
        let redirectInputs = document.querySelectorAll('.redirect');
        let table = document.getElementById('utm-list');
        for (let r = 0; r < checkboxes.length; r++) {
            let tmpC = 0;
            // loops through each row to get checked ones
            if (checkboxes[r].checked) {
                let rdl = redirectInputs.length - 1;
                for (let c = rdl; c > -1; c--) {
                    tmpC++
                    if (redirectInputs[c].value != "") {
                        console.log(redirectInputs[c].value);
                        table.rows[r].cells[tmpC].innerHTML = redirectInputs[c].value;
                        popupMessage('Redirects updated!', 'green');
                    }
                }
            }
        }
    }

})();
