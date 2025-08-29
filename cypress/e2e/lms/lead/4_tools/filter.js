const { faker } = require('@faker-js/faker');
const { filterElements, dropdownFilter } = require('../../../../helpers/filter');
const { cyGet, onesecondWait, twosecondWait, buSearchbox } = require('../../../../helpers/global');
const { fetchOptions } = require('../../../../helpers/record');
const globalSel = require('../../../../selector/globalSel');
const lead = require('../../../../selector/lead');

function getPreviousMonth(date) {
    const currentMonth = date.getMonth(); // 0 (January) to 11 (December)
    const previousMonthDate = new Date(date.setMonth(currentMonth - 1));
    const monthName = previousMonthDate.toLocaleString('default', { month: 'long' });
    return monthName;
}

const currentDate = new Date(); // Current date
const previousMonth = getPreviousMonth(currentDate);

describe(`Navigate on filter and test filter functoinality`, function () {
    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existsPipelines")
        cy.intercept("GET", `**/rms/tools/filters?*`).as("filters")
        cy.intercept("POST", `**/rms/records/grid?*`).as("gridRecord")
        cy.visit(`${updatedUrl}/${asset}s`)
        cyGet('#bu-layout [aria-label="Grid view"]').click()
    });

    context(`Apply filter on string-based field to filter the records`, () => {

        it(`Apply “contains” filter`, () => {
            cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                const stringBasedProp = response.body.result.view.columns.find(fld => ["phn", "str", "txa"].includes(fld.prop));
                const findFieldValues = response.body.result.values.find(ele => ele[stringBasedProp.id])
                const firstThreeChars = findFieldValues
                    ? findFieldValues[stringBasedProp.id].substring(0, 3)
                    : faker.string.alpha(3);
                filterElements(stringBasedProp.label, firstThreeChars, "Contains")
                cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                    if (response.body.result.values.length > 0) {
                        const filterdValues = response.body.result.values.map(ele => ele[stringBasedProp.id])
                        expect(filterdValues[0]).contains(firstThreeChars)
                        response.body.result.values.forEach(valueArray => {
                            // expect(valueArray[stringBasedProp.id]).to.contain(firstThreeChars);
                            const keys = Object.keys(valueArray)
                            const findKey = keys.find(ele => ele === stringBasedProp.id)
                            if (findKey) {
                                expect(valueArray[stringBasedProp.id]).to.contain(firstThreeChars);
                            } else {
                                expect(valueArray).has.not.property(stringBasedProp.id);
                            }
                        });
                    } else {
                        cy.log(response.body.result.values)
                    }

                })
                cyGet('[data-testid="filtercomponentheader-box-im1u1ii6n"] > [data-testid="buchip-chip-5r51zm55o"]').click()
            })
        })

        it(`Apply “Does not contains” filter`, () => {
            cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                const stringBasedProp = response.body.result.view.columns.find(fld => ["phn", "str", "txa"].includes(fld.prop));
                const findFieldValues = response.body.result.values.find(ele => ele[stringBasedProp.id])
                const firstThreeChars = findFieldValues
                    ? findFieldValues[stringBasedProp.id].substring(0, 3)
                    : faker.string.alpha(3);
                filterElements(stringBasedProp.label, firstThreeChars, "Does not contains")
                cy.wait("@gridRecord")
                cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                    response.body.result.values.forEach(valueArray => {
                        const keys = Object.keys(valueArray)
                        const findKey = keys.find(ele => ele === stringBasedProp.id)
                        if (findKey) {
                            expect(valueArray[stringBasedProp.id]).not.contain(firstThreeChars);
                        } else {
                            expect(valueArray).has.not.property(stringBasedProp.id);
                        }
                    });
                })
                cyGet('[data-testid="filtercomponentheader-box-im1u1ii6n"] > [data-testid="buchip-chip-5r51zm55o"]').click()
            })
        })

        it(`Apply “Starts with” filter`, () => {
            cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                const stringBasedProp = response.body.result.view.columns.find(fld => ["phn", "str", "txa"].includes(fld.prop));
                const findFieldValues = response.body.result.values.find(ele => ele[stringBasedProp.id])
                const firstThreeChars = findFieldValues
                    ? findFieldValues[stringBasedProp.id].substring(0, 3)
                    : faker.string.alpha(3);
                filterElements(stringBasedProp.label, firstThreeChars, "Starts with")
                cy.wait("@gridRecord")
                cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                    response.body.result.values.forEach(value => {
                        const startingDigit = value[stringBasedProp.id].substring(0, 3)
                        expect(startingDigit).to.equal(firstThreeChars);
                    });
                })
                cyGet('[data-testid="filtercomponentheader-box-im1u1ii6n"] > [data-testid="buchip-chip-5r51zm55o"]').click()
            })
        })

        it(`Apply "Ends with" filter`, () => {
            cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                const stringBasedProp = response.body.result.view.columns.find(fld => ["phn", "str", "txa"].includes(fld.prop));
                const findFieldValues = response.body.result.values.find(ele => ele[stringBasedProp.id])
                const lastThreeChars = findFieldValues
                    ? findFieldValues[stringBasedProp.id].slice(-3)
                    : faker.string.alpha(3);
                filterElements(stringBasedProp.label, lastThreeChars, "Ends with")
                cy.wait("@gridRecord")
                cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                    response.body.result.values.forEach(value => {
                        const keys = Object.keys(value)
                        const findKey = keys.find(ele => ele === stringBasedProp.id)
                        if (findKey) {
                            const lastDigits = value[stringBasedProp.id].slice(-3)
                            expect(lastDigits).to.equal(lastThreeChars);
                        } else {
                            expect(value).has.not.property(stringBasedProp.id);
                        }

                    });
                })
                cyGet('[data-testid="filtercomponentheader-box-im1u1ii6n"] > [data-testid="buchip-chip-5r51zm55o"]').click()
            })
        })

        it(`Apply “Equals” filter`, () => {
            cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                const stringBasedProp = response.body.result.view.columns.find(fld => ["phn", "str", "txa"].includes(fld.prop));
                const findFieldValues = response.body.result.values.find(ele => ele[stringBasedProp.id])
                const fieldvalue = findFieldValues[stringBasedProp.id]
                filterElements(stringBasedProp.label, fieldvalue, "Equals")
                cy.wait("@gridRecord")
                cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                    response.body.result.values.forEach(valueArray => {
                        expect(valueArray[stringBasedProp.id]).eq(fieldvalue);
                    });
                })
                cyGet('[data-testid="filtercomponentheader-box-im1u1ii6n"] > [data-testid="buchip-chip-5r51zm55o"]').click()
            })
        })

        it(`Apply “Does not equals” filter`, () => {
            cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                const stringBasedProp = response.body.result.view.columns.find(fld => ["phn", "str", "txa"].includes(fld.prop));
                const findFieldValues = response.body.result.values.find(ele => ele[stringBasedProp.id])
                const fieldvalue = findFieldValues[stringBasedProp.id]
                filterElements(stringBasedProp.label, fieldvalue, "Does not equals")
                cy.wait("@gridRecord");
                cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                    response.body.result.values.forEach(valueArray => { expect(valueArray[stringBasedProp.id]).not.eq(fieldvalue) });
                })
                cyGet('[data-testid="filtercomponentheader-box-im1u1ii6n"] > [data-testid="buchip-chip-5r51zm55o"]').click()
            })
        })
    });

    context(`Apply filter on dropdown-based field to filter the records`, function () {
        it(`Apply  filter on stage`, function () { dropdownFilter("stg", this) });
        it(`Apply  filter on owner`, function () { dropdownFilter("own", this) });
    });

    context(`Apply filter on date&time-based field to filter the records`, function () {
        it(`Filter records based on the date & time field`, () => {
            cy.wait("@existsPipelines", { timeout: 10000 })
            cy.get('#filter').click()
            cy.wait("@filters").then(({ response }) => {
                let propDtm = response.body.result.filter(ele => ele.prop == "dtm")
                cy.get(lead.searchInfilter).type(propDtm[0].label)
                cy.wait(500)
                cy.get(`span[aria-label="${propDtm[0].label}"]`).click()
            })
            cy.get(lead.filerCaption).contains("Today till midnight").click()
            cy.wait(500)
            cy.get(lead.filerCaption).contains("Last 7 days").click()
            cy.wait(500)
            cy.get(lead.filerCaption).contains("Last 30 days").click()
            cy.wait(500)
            cy.get(lead.filerCaption).contains("Last 3 months").click()
            cy.wait(500)
            cy.get(lead.filerCaption).contains("Custom Date").click()
            cy.get('.rdrMonthPicker > select').select(previousMonth) // Select previous month
            cy.get('.rdrDayStartOfMonth > .rdrDayNumber').click() // Choose date of previous month
            cy.get('.rdrNextButton').click() // Click on next button to move on current month
            cy.get('.rdrDayToday > .rdrDayNumber').click() // Choose date of current month
        });
    });
});