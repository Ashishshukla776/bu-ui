import globalSel from "../selector/globalSel";
import { buSearchbox, cyGet, onesecondWait, twosecondWait } from "./global";
import { fetchOptions } from "./record";

export const openFilterUI = (label) => {
    // Open Filter UI
    cyGet('#filter').click();
    cyGet('[data-testid="filtercomponentheader-typography-ohyu6f04a"]').should("have.text", "Filter");
    cyGet(`[placeholder="Search..."]`).clear().type(label, { force: true });
    onesecondWait();
    cyGet(`[data-testid="filterheader-box-jox1agcx8"] > [aria-label="${label}"]`).click();
}
export const filterElements = (fieldLabel, filterValue, filterOption) => {
    openFilterUI(fieldLabel)
    cyGet(`[data-testid="comparestringfilter-box-f914y6cfe"] [placeholder="Add value..."]`).type(filterValue, { force: true })
    twosecondWait()
    cyGet(`[data-testid="detailcomponents-typography-olqv5ccai"]`).contains(filterOption).click()
}

export function dropdownFilter(prop, ctx) {
    return cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
        const dropdownBasedProp = response.body.result.view.columns.find(fld => fld.prop === prop);
        if (!dropdownBasedProp) { ctx.skip(); }
        const findFieldValues = response.body.result.values.map(ele => ele[dropdownBasedProp.id]);
        openFilterUI(dropdownBasedProp.label)

        cy.wait("@filters", { timeout: 10000 }).then(({ response }) => {
            const findFieldInFilter = response.body.result.find(fld => fld.label === dropdownBasedProp.label);

            fetchOptions(findFieldInFilter).then((optionResult) => {
                // Get the correct label for filter option (array or object)
                const targetLabel = findFieldValues.flatMap(v => Array.isArray(v) ? v.map(x => x.label) : [v?.label]).filter(Boolean)[0];

                const filterOption = optionResult.find(ele => ele.label === targetLabel);

                if (optionResult.length > 5) {
                    buSearchbox(`[data-testid="buvirtuallist-box-jlthmp7vd"] ${globalSel.searchplaceholder}`, filterOption.label);
                }

                cyGet(`[data-testid="detailview-listitembutton-pci9wovuw"]`).contains(filterOption.label).click();

                // Validate records in filtered result
                cy.wait("@gridRecord", { timeout: 10000 }).then(({ response }) => {
                    if (response.body.result.values.length > 0) {
                        response.body.result.values.forEach(value => {
                            const fieldValue = value[dropdownBasedProp.id];
                            if (Array.isArray(fieldValue)) {
                                const match = fieldValue.some(item => item.label === targetLabel);
                                expect(match).to.be.true;
                            } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                                expect(fieldValue).to.have.property('label', targetLabel);
                            } else {
                                throw new Error(`Unexpected type for ${dropdownBasedProp.id}`);
                            }
                        });
                    } else {
                        cy.log(`Record not found after apply filter: ${response.body.result.values}`)
                    }

                });

                // Clear filter chip
                cyGet('[data-testid="filtercomponentheader-box-im1u1ii6n"] > [data-testid="buchip-chip-5r51zm55o"]').click();
            });
        });
    });
};
