const lead = require('../../../../selector/lead')
const { faker } = require('@faker-js/faker')
const { buButton, cyGet, budropdownInput, budropdown, buSaveButton } = require('../../../../helpers/global')
const { labelNplaceholder, preview, searchField, previewDateField } = require('../../../../helpers/field')
const globalSel = require('../../../../selector/globalSel')
const fieldSel = require('../../../../selector/fieldSel')
const { method } = require('../../../../helpers/helper')
describe(`Nevigate the setting page and test the date and time fields`, () => {

    const url = Cypress.env("url")
    const module = Cypress.env("module")
    const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept(method.get, '**/rms/assets/pipelines?view=dsrc').as("assetsPipeline")
        cy.intercept(method.get, '**/fms/fields/grid?*').as("fieldGrid")
        cy.visit(`${updatedUrl}/setting/properties`);
    });

    const dateDailogComponent = (year, date) => {
        cy.get('.MuiPickersCalendarHeader-label').click()
        cy.get('.MuiPickersYear-yearButton').contains(year).click()
        cy.get('.MuiIconButton-edgeEnd').click()
        cy.get('.MuiIconButton-edgeStart').click()
        cy.get('.MuiDateCalendar-root [role="gridcell"]').contains(date).click()
        // cy.get('.MuiPickersLayout-root > .MuiDialogActions-root > .MuiButtonBase-root').contains("OK").click()
    }

    it(`Create date and time field with Calendar Type`, () => {
        let dtmField = `dateNtime-${new Date().valueOf()}`
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Date and Time Field", globalSel.dialogTitleText);
        labelNplaceholder(dtmField, `Please select Date & Time`)
        cy.get('[role="dialog"] [data-testid="buswitch-button-79w8xnphk"]').should("have.attr", "aria-checked", "false");
        cyGet(`[data-testid="withtitle-inputlabel-9gzd3akk8"]`).contains("Calendar Type");
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "None", null, null, "Past Dates", globalSel.dialogTitleText)

        cyGet(`[data-testid="withtitle-inputlabel-9gzd3akk8"]`).contains("Days of week Restricted");
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "Select", 7, globalSel.search, "Saturday", globalSel.dialogTitleText)
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "Saturday")

        cyGet(`[data-testid="buradiogroup-formlabel-ofdcw41bb"]`).contains("Time Format");
        cyGet(`[data-testid="buradiogroup-radiogroup-tdw0bqbm7"]`)
            .find(`[data-testid="buradiogroup-formcontrollabel-si19q88zv"]`)
            .first()
            .find(`input`)
            .should("have.value", "24")

        // cy.componentLabel(lead.formLabel, "Time Format", "input[value='12']").should("be.checked").and("have.attr", "type", "radio")
        // cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiTypography-root').should("have.text", "12hrs")
        // cy.componentLabel(lead.formLabel, "Time Format", "input[value='24']").should("have.attr", "type", "radio").click()
        // cy.get('.MuiFormGroup-root > :nth-child(1) > .MuiTypography-root').should("have.text", "24hrs")
        previewDateField(dtmField, `Please select Date & Time`)
        buSaveButton().click()
    });

    it(`Create date and time field with Date Range Selection`, () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentDay = String(today.getDate())
        const previousDate = new Date();
        previousDate.setFullYear(previousDate.getFullYear() - 1);
        const prevYear = previousDate.getFullYear();
        let dtmField = `dateNtime-${new Date().valueOf()}`;

        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Date and Time Field", globalSel.dialogTitleText);
        labelNplaceholder(dtmField, `Please select Date & Time`)
        cy.get('[role="dialog"] button[role="switch"]').click()
        // Choose Min Date
        cy.get('[placeholder= "Min"]').prev().find('button').click()
        dateDailogComponent(prevYear, "1")
        cy.get('.MuiPickersLayout-root > .MuiDialogActions-root > .MuiButtonBase-root').contains("OK").click()
        cy.wait(250)
        // Choose Max Date
        cy.get('[placeholder= "Max"]').prev().find('button').click()
        dateDailogComponent(currentYear, currentDay)
        cy.get('.MuiPickersLayout-root > .MuiDialogActions-root > .MuiButtonBase-root').contains("OK").click()
        // Calendar Type should be disabled when choose Date Range Selection
        cyGet(`[data-testid="withtitle-box-mp6w6v7ka"] [data-testid="budropdown-box-ty1opau5a"] button`).should("be.disabled")
        // Restricte days
        cyGet(`[data-testid="withtitle-inputlabel-9gzd3akk8"]`).contains("Days of week Restricted");
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "Select", 7, globalSel.search, "Saturday", globalSel.dialogTitleText)
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "Saturday")
        // Choose date format
        cyGet(`[data-testid="buradiogroup-radiogroup-tdw0bqbm7"]`)
            .find(`[data-testid="buradiogroup-formcontrollabel-si19q88zv"]`)
            .last()
            .find(`input`)
            .should("have.value", "12")
        previewDateField(dtmField, `Please select Date & Time`)
        buSaveButton().click()
    });

    it(`Edit date and time field`, () => {
        let dtmFieldLabel = `dateNtime-${new Date().valueOf()}`;
        searchField("dtm", null, 'Edit');
        labelNplaceholder(dtmFieldLabel, `Please select Date & Time`);
        previewDateField(dtmFieldLabel, `Please select Date & Time`);
        buSaveButton().click()
    })

    it(`Create date field with Calendar Type`, () => {
        let dateField = `Date-${new Date().valueOf()}`
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Date Field", globalSel.dialogTitleText);
        labelNplaceholder(dateField, `Please select Date`)
        cy.get('[role="dialog"] [data-testid="buswitch-button-79w8xnphk"]').should("have.attr", "aria-checked", "false");
        cyGet(`[data-testid="withtitle-inputlabel-9gzd3akk8"]`).contains("Calendar Type");
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "None", null, null, "Past Dates", globalSel.dialogTitleText)

        cyGet(`[data-testid="withtitle-inputlabel-9gzd3akk8"]`).contains("Days of week Restricted");
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "Select", 7, globalSel.search, "Saturday", globalSel.dialogTitleText)
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "Saturday")
        previewDateField(dateField, `Please select Date`)
        buSaveButton().click()
    });

    it(`Create date field with Date Range Selection`, () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentDay = String(today.getDate())
        const previousDate = new Date();
        previousDate.setFullYear(previousDate.getFullYear() - 1);
        const prevYear = previousDate.getFullYear();
        let dateField = `date-${new Date().valueOf()}`;

        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Date Field", globalSel.dialogTitleText);
        labelNplaceholder(dateField, `Please select Date`)
        cy.get('[role="dialog"] button[role="switch"]').click()
        // Choose Min Date
        cy.get('[placeholder= "Min"]').prev().find('button').click()
        dateDailogComponent(prevYear, "1")
        cy.wait(250)
        // Choose Max Date
        cy.get('[placeholder= "Max"]').prev().find('button').click()
        dateDailogComponent(currentYear, currentDay)
        // Calendar Type should be disabled when choose Date Range Selection
        cyGet(`[data-testid="withtitle-box-mp6w6v7ka"] [data-testid="budropdown-box-ty1opau5a"] button`).should("be.disabled")
        // Restricte days
        cyGet(`[data-testid="withtitle-inputlabel-9gzd3akk8"]`).contains("Days of week Restricted");
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "Select", 7, globalSel.search, "Saturday", globalSel.dialogTitleText)
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "Saturday")
        previewDateField(dateField, `Please select Date`)
        buSaveButton().click()
    });

    it(`Edit date field`, () => {
        let fieldLabel = `Date-${new Date().valueOf()}`
        searchField("dat", null, 'Edit')
        labelNplaceholder(fieldLabel, `Please select Date`)
        previewDateField(fieldLabel, `Please select Date`)
        buSaveButton().click()
    })

    it(`Create time field`, () => {
        let timeField = `Time-${new Date().valueOf()}`
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Time Field", globalSel.dialogTitleText);
        labelNplaceholder(timeField, `Please select Time`)
        cyGet(`[data-testid="buradiogroup-radiogroup-tdw0bqbm7"]`)
            .find(`[data-testid="buradiogroup-formcontrollabel-si19q88zv"]`)
            .last()
            .find(`input`)
            .should("have.value", "12")
        previewDateField(timeField, `Please select Time`)
        buSaveButton().click()
    });

    it(`Edit time field`, () => {
        let fieldLabel = `Time-${new Date().valueOf()}`
        searchField("tim", null, 'Edit')
        labelNplaceholder(fieldLabel, `Please select Time`)
        cyGet(`[data-testid="buradiogroup-radiogroup-tdw0bqbm7"]`)
            .find(`[data-testid="buradiogroup-formcontrollabel-si19q88zv"]`)
            .last()
            .find(`input`)
            .should("have.value", "12")
        previewDateField(fieldLabel, `Please select Time`)
        buSaveButton().click()
    })
})
