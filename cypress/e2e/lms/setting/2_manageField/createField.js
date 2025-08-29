const { labelNplaceholder, preview, searchField } = require('../../../../helpers/field');
const { buButton, cyGet, budropdownInput, buSaveButton, budropdown, twosecondWait, butextField } = require('../../../../helpers/global');
const messages = require('../../../../helpers/messages');
const fieldSel = require('../../../../selector/fieldSel');
const globalSel = require('../../../../selector/globalSel');

describe(`Navigate to setting page and create and update fields`, () => {

    let field;
    const url = Cypress.env("url")
    const module = Cypress.env("module")
    // const asset = Cypress.env("asset")
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept('GET', '**/rms/assets/pipelines?view=dsrc').as("assetsPipeline")
        cy.intercept('GET', '**/fms/fields/grid?*').as("fieldGrid")
        cy.visit(`${updatedUrl}/setting/properties`)
    });

    it(`Create URL field`, () => {
        let fieldLabel = `URL-${new Date().valueOf()}`;
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "URL", globalSel.dialogTitleText);
        labelNplaceholder(fieldLabel, `Enter ${fieldLabel}`);
        preview(fieldLabel, `Enter ${fieldLabel}`);
        buSaveButton().click()
    });

    it(`Edit URL field`, () => {
        let fieldLabel = `URL-${new Date().valueOf()}`
        searchField("url", null, 'Edit')
        labelNplaceholder(fieldLabel, `Enter ${fieldLabel}`)
        preview(fieldLabel, `Enter ${fieldLabel}`)
        buSaveButton().click()
        cyGet(globalSel.SnackbarMessage).invoke('text').should('include', messages.updated)
    })

    it(`Create Mobile number field`, () => {
        let fieldLabel = `Mobile-${new Date().valueOf()}`;
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Mobile number", globalSel.dialogTitleText);
        labelNplaceholder(fieldLabel, `Enter ${fieldLabel}`);
        budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "none", null, null, "4-3-3", globalSel.dialogTitleText);
        preview(fieldLabel, `Enter ${fieldLabel}`);
        buSaveButton().click()
    });

    it(`Get phn field details through interception for edit phn field`, () => {
        searchField("phn", null, 'Edit').then((fieldData) => { cy.wrap(fieldData).as("fieldData") });
        cy.get("@fieldData").then((res) => { field = res })
    })

    it(`Edit Mobile number field`, () => {
        let fieldLabel = `Mobile-${new Date().valueOf()}`
        cy.intercept('GET', `**/fms/fields/${field.id}?*`).as("getFieldById")
        searchField("phn", field.label, 'Edit')
        cy.wait("@getFieldById", { timeout: 10000 }).then(({ response }) => {
            const format = response.body.result.format
            labelNplaceholder(fieldLabel, `Enter ${fieldLabel}`);
            budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, format, null, null, "4-4-2", globalSel.dialogTitleText)
            preview(fieldLabel, `Enter ${fieldLabel}`);
            buSaveButton().click()
            cyGet(globalSel.SnackbarMessage).invoke('text').should('include', messages.updated)
        })
    })

    it(`Create Number field`, () => {
        let fieldLabel = `Number-${new Date().valueOf()}`
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Number", globalSel.dialogTitleText);
        labelNplaceholder(fieldLabel, `Enter ${fieldLabel}`);
        // budropdown(globalSel.dialogContent, `button ${globalSel.buttonTypography}`, "none", null, null, "4-3-3", globalSel.dialogTitleText);
        butextField(globalSel.butextfield, "#min").type(2)
        butextField(globalSel.butextfield, "#max").type(1000)
        butextField(globalSel.butextfield, "#decimal").type(3)
        // cy.componentLabel(lead.formLabel, "Min Number", "input").type(2)
        // cy.componentLabel(lead.formLabel, "Max Number", "input").type(10)
        // cy.componentLabel(lead.formLabel, "Decimal Points", "input").type(2)
        cyGet('[data-testid="withtitle-inputlabel-9rg7j5v06"]').contains("Max-3")
        preview(fieldLabel, `Enter ${fieldLabel}`);
        buSaveButton().click()
    });

    it(`Edit Number field`, () => {
        let fieldLabel = `Number-${new Date().valueOf()}`
        searchField("num", null, 'Edit');
        labelNplaceholder(fieldLabel, `Enter ${fieldLabel}`)
        butextField(globalSel.butextfield, "#min").clear().type(3)
        butextField(globalSel.butextfield, "#max").clear().type(50000)
        butextField(globalSel.butextfield, "#decimal").clear().type(2)
        cyGet('[data-testid="withtitle-inputlabel-9rg7j5v06"]').contains("Max-3")
        preview(fieldLabel, `Enter ${fieldLabel}`)
        buSaveButton().click()
        cyGet(globalSel.SnackbarMessage).invoke('text').should('include', messages.updated)
    })

    it(`Create Rating field`, () => {
        let fieldLabel = `Rating-${new Date().valueOf()}`
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Rating", globalSel.dialogTitleText);
        // labelNplaceholder(fieldLabel, `Enter ${fieldLabel}`);
        cyGet(fieldSel.fieldlabelboxId).clear().type(fieldLabel)
        cy.get('[data-testid="ratingfield-typography-34xvi9zqr"]').contains("Type").next()
            .find('button').should("be.disabled")
            .find('[data-testid="button-typography-8x5inumxs"]').should("have.text", "Star")
        cy.get('[data-testid="ratingfield-typography-lms2xp00s"]').contains("Max").next()
            .find('button').should("be.disabled")
            .find('[data-testid="button-typography-8x5inumxs"]').should("have.text", "5")
        cy.get('[data-testid="burating-formlabel-pfw5vth6c"]').contains(fieldLabel)
        cy.get('[data-testid="burating-styledrating-i1n90l9jw"] > label').click({ multiple: true, force: true })
        buSaveButton().click()
    });

    it(`Edit Rating field`, () => {
        let fieldLabel = `Rating-${new Date().valueOf()}`
        searchField("rtg", null, 'Edit');
        cyGet(fieldSel.fieldlabelboxId).clear().type(fieldLabel)
        cy.get('[data-testid="ratingfield-typography-34xvi9zqr"]').contains("Type").next()
            .find('button').should("be.disabled")
            .find('[data-testid="button-typography-8x5inumxs"]').should("have.text", "Star")
        cy.get('[data-testid="ratingfield-typography-lms2xp00s"]').contains("Max").next()
            .find('button').should("be.disabled")
            .find('[data-testid="button-typography-8x5inumxs"]').should("have.text", "5")
        cy.get('[data-testid="burating-formlabel-pfw5vth6c"]').contains(fieldLabel)
        cy.get('[data-testid="burating-styledrating-i1n90l9jw"] > label').click({ multiple: true, force: true })
        buSaveButton().click()
    })

    it(`Create checkbox field`, () => {
        const fieldLabel = `Checkbox-${Date.now()}`;

        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(fieldSel.fieldlabelbox).contains("Select Field Type");

        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Checkbox", globalSel.dialogTitleText);

        cyGet(fieldSel.fieldlabelboxId).clear().type(fieldLabel);

        ["Option 2", "Option 3"].forEach((optionText, index) => {
            buButton(globalSel.typBtn).contains("Add option").click();
            butextField(fieldSel.fieldOptionTextfield, `input[value = "${optionText}"]`).should("have.value", optionText);
        });

        const checkboxWrapper = `[data-testid="withtruncate-wrapped-jhk5rb2jw"]`;

        cyGet(`[data-testid^="bucheckboxgroup-formlabel"]`).contains(fieldLabel);
        ["Option 1", "Option 2", "Option 3"].forEach((optionText) => {
            cyGet(checkboxWrapper).contains(optionText).should("have.attr", "aria-label", optionText);
        });

        buSaveButton().click();
    });


    it(`Edit checkbox field`, () => {
        const newLabel = `Checkbox-${Date.now()}`;
        const newOption = `Option-${Date.now()}`;

        searchField("chk", null, 'Edit');

        cyGet(fieldSel.fieldlabelboxId).clear().type(newLabel);

        butextField(`${fieldSel.fieldOptionTextfield} :nth-child(1)`, `input`).first().clear().type("Edited Option 1");

        buButton(globalSel.typBtn).contains("Add option").click();
        cy.get(fieldSel.fieldOptionTextfield).last().find("input").clear().type(newOption);

        const checkboxWrapper = `[data-testid="withtruncate-wrapped-jhk5rb2jw"]`;

        cyGet(checkboxWrapper).contains("Edited Option 1").should("have.attr", "aria-label", "Edited Option 1");
        cyGet(checkboxWrapper).contains(newOption).should("have.attr", "aria-label", newOption);

        buSaveButton().click();
    });


    it(`Create radio field`, () => {
        let fieldLabel = `Radio-${new Date().valueOf()}`
        buButton(fieldSel.createFieldBtn).contains("Create field").click();
        cyGet(`${fieldSel.fieldlabelbox}`).contains("Select Field Type")
        budropdownInput(`${globalSel.muiInput} input[name="Select Field Type"]`, "Single line text", 6, `${globalSel.searchbox} input`, "Radio", globalSel.dialogTitleText);
        cyGet(fieldSel.fieldlabelboxId).clear().type(fieldLabel);

        ["Option 2", "Option 3"].forEach((optionText, index) => {
            buButton(globalSel.typBtn).contains("Add option").click();
            butextField(fieldSel.fieldOptionTextfield, `input[value = "${optionText}"]`).should("have.value", optionText);
        });

        const checkboxWrapper = `[data-testid="withtruncate-wrapped-jhk5rb2jw"]`;

        cyGet(`[data-testid^="bucheckboxgroup-formlabel"]`).contains(fieldLabel);
        ["Option 1", "Option 2", "Option 3"].forEach((optionText) => {
            cyGet(checkboxWrapper).contains(optionText).should("have.attr", "aria-label", optionText);
        });

        buSaveButton().click();
    });

    it(`Edit radio field`, () => {
        const newLabel = `Radio-${Date.now()}`;
        const newOption = `Option-${Date.now()}`;

        searchField("rad", null, 'Edit');

        cyGet(fieldSel.fieldlabelboxId).clear().type(newLabel);

        butextField(fieldSel.fieldOptionTextfield, `:nth-child(1) input`).first().clear().type("Edited Option 1");

        buButton(globalSel.typBtn).contains("Add option").click();
        cy.get(fieldSel.fieldOptionTextfield).last().find("input").clear().type(newOption);

        const checkboxWrapper = `[data-testid="withtruncate-wrapped-jhk5rb2jw"]`;

        cyGet(checkboxWrapper).contains("Edited Option 1").should("have.attr", "aria-label", "Edited Option 1");
        cyGet(checkboxWrapper).contains(newOption).should("have.attr", "aria-label", newOption);

        buSaveButton().click();
    })
})
