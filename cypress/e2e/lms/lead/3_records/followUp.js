const { faker } = require('@faker-js/faker')
const lead = require('../../../../selector/lead')
const { cyGet, twosecondWait } = require('../../../../helpers/global');
const moment = require('moment');
describe(`Test the functionality of follow up`, () => {

    const url = Cypress.env("url");
    const module = Cypress.env("module");
    const asset = Cypress.env("asset");
    let updatedUrl = url.replace("one", module);

    beforeEach(() => {
        cy.intercept("GET", `**/crew/users/app-auth?*`).as("appAuth")
        cy.intercept("POST", `**/fms/pipelines/exists?*`).as("existsPipeline")
        cy.intercept("POST", `**/rms/records/split?*`).as("splitView")
        cy.intercept("GET", `**/rms/tools/followups/*`).as("followupStatus");
        cy.intercept("GET", `**/rms/tools/followups?*`).as("getFollowup")
        cy.visit(`${updatedUrl}/${asset}s`)
        cyGet('[data-testid="buelementgroup-box-n1f8dc7ag"]').find('[aria-label="Split view"] button').click();
    });

    const createNewFollowUP = () => {
        cyGet(`[data-testid="followup-iconbutton-4twf9rpig"]`).click();
        cyGet(`[role="dialog"] [data-testid="followup-box-amckk3g8f"] [data-testid="Clear"]`)
            .should("contain.text", "Clear")
        cyGet(`[role="dialog"] [data-testid="followup-box-ltzjxy6tq"] [data-testid="Cancel"]`)
            .should("contain.text", "Cancel")
        cyGet(`[role="dialog"] [data-testid="followup-box-ltzjxy6tq"] [data-testid="OK"]`)
            .should("contain.text", "OK").click()
    };

    const inputRemark = () => {
        cyGet(`[role="tooltip"] [data-testid="butextarea-textfield-nvtcklezl"] label`)
            .contains("Remark")
            .next()
            .find("textarea").first().type(faker.lorem.lines());
        cyGet(`[role="tooltip"] [data-testid="Save"]`).click()
    };

    const validateFollowup = (childSel, text) => {
        cyGet(`#tool-container [data-testid="buvirtuallist-div-fv0syu6gz"]`)
            .first()
            .find(childSel).contains(text)
    }

    it(`Create follow-up for record`, () => {


        // cyGet(`[data-testid="followup-typography-buacu26k2"]`).should("contain.text", "Follow-up date")

        cy.wait("@followupStatus", { timeout: 30000 }).then(({ response }) => {
            twosecondWait()
            const followStatus = response.body.result?.status
            cyGet(`[data-testid="followup-iconbutton-4twf9rpig"]`).click();
            if (followStatus === "pending") {
                inputRemark();
                cy.reload();
                createNewFollowUP();
            } else {
                createNewFollowUP();
            }
        });

    });

    it(`Verify folow up created or not`, () => {
        cyGet(`[aria-label="Follow Up"]`).click()
        cy.wait("@getFollowup", { timeout: 10000 }).then(({ response }) => {
            const followupDetail = response.body.result.values[0]
            const formattedScheduledOn = moment(followupDetail?.scheduledOn).format("DD MMM YYYY, h:mm A");
            const formattedCreatedOn = moment(followupDetail?.createdOn).format("DD MMM YYYY, h:mm A");
            cyGet(`#tool-container [data-testid="followuplist-box-ans7d4l18"] h6`).should("contain.text", "Follow-up History");
            cyGet(`#tool-container [data-testid="followuplist-typography-rweu6rcqo"]`).should("contain.text", "Scheduled on: ");
            cyGet(`#tool-container [data-testid="followuplist-typography-rweu6rcqo"]`).should("contain.text", formattedScheduledOn);
            cyGet(`#tool-container [data-testid="followuplist-typography-66kydwtv0"]`).should("contain.text", formattedCreatedOn);
        })

    });

    it(`Remark follow Up`, () => {
        cyGet(`[data-testid="followup-iconbutton-4twf9rpig"]`).click();
        inputRemark();

    });

    it(`verify follow up after remark`, () => {
        cyGet(`[aria-label="Follow Up"]`).click()
        cy.wait("@getFollowup", { timeout: 10000 }).then(({ response }) => {
            const followupDetail = response.body.result.values[0]
            const formattedScheduledOn = moment(followupDetail?.scheduledOn).format("DD MMM YYYY, h:mm A");
            const formattedCreatedOn = moment(followupDetail?.createdOn).format("DD MMM YYYY, h:mm A");
            const formattedfollowedUpOn = moment(followupDetail?.followedUpOn).format("DD MMM YYYY, h:mm A");
            validateFollowup(`[data-testid="followuplist-typography-uvdjc7jp2"]`, "Scheduled on")
            validateFollowup(`[data-testid="followuplist-typography-2uwam0ib5"]`, formattedScheduledOn)
            validateFollowup(`[data-testid="followuplist-typography-mbqzjmh26"]`, "Followed up on")
            validateFollowup(`[data-testid="followuplist-typography-oaxl04km4"]`, formattedfollowedUpOn)
            validateFollowup(`[data-testid="followuplist-typography-9p4iy3xy5"]`, "Creation date")
            validateFollowup(`[data-testid="followuplist-typography-j73cs8h41"]`, formattedCreatedOn)
        });
    });
});