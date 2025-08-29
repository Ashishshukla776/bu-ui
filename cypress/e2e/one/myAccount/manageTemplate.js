const { cyGet, butextField, budropdown, buSearchbox, budropdownOption, buSaveButton, onesecondWait, twosecondWait, logout, buCaption } = require('../../../helpers/global');
const { permission, setPermissionOnRoleSwitch } = require('../../../helpers/permissions');
const globalSel = require('../../../selector/globalSel');
const lead = require('../../../selector/lead')

describe(`Manage User functionality test`, () => {
  const uniqueTemplateName = `Template_${Date.now()}`;
  const uniqueTemplateNameupdated = `Temp_${Date.now()}`;

  beforeEach(() => {
    cy.intercept('GET', '**/crew/users/app-auth?*').as("appAuth");
    cy.intercept('GET', '**/grd/modules/permission*').as("modulePermission");
    cy.intercept('GET', '**/crew/users/exists?*').as("userExist");
    cy.intercept('GET', '**/fms/pipelines?*').as('getPipelines');
    cy.intercept('GET', '**/grd/templates/grid?*').as('templateGrid');
    cy.intercept('POST', '**/crew/users/grid?*').as('userGrid');
    cy.intercept('GET', '**fms/fields/list?*').as('tempFieldsList');
    cy.intercept('GET', '**/grd/templates').as('getTempalte');
    cy.login();
    cy.visit(`${Cypress.env("url")}/profile`);
    cy.wait("@appAuth", { timeout: 10000 }).then(({ response }) => {
      if (response.body.result.user.role === "std") { this.skip() }
    })
  });

  function formatModuleName(key) {
    const map = {
      lms: 'Lead Management',
      crm: 'CRM',
      cnf: 'Approval',
      task: 'Task Management',
      invoice: 'Invoice',
      recruitment: 'Recruitment',
      employee: 'Employee',
      asset: 'Asset',
      dsa: 'Direct Selling Agent'
    };
    return map[key] || key;
  }

  context(`Add Template`, function () {

    it('Verify the selected software and available softwares on the Create Template page', function () {
      cy.visit(`${Cypress.env("url")}/profile?tab=manageTemplate`);
      cyGet(globalSel.createtestid).contains("Create").click();
      cy.wait("@modulePermission", { timeout: 10000 }).then(({ response }) => {
        const [firstModule, ...availableModules] = response.body.result.add;
        cyGet(`[data-testid="permissionsoftwarelist-typography-ftrzexyr7"]`).should("contain.text", "Selected software")
        cyGet(`[data-testid="permissionsoftwarelist-menulist-aafxej4yj"]`)
          .first()
          .find('[data-testid="permissionsoftwarelist-typography-zackmqq0q"]')
          .should('contain.text', formatModuleName(firstModule)); // e.g. Lead Management
        availableModules.forEach((module) => {
          cyGet('[data-testid="permissionsoftwarelist-menulist-2qkcm4j30"]')
            .find(`[data-testid="permissionsoftwarelist-typography-86cpoqkhp"]`)
            .should('contain.text', formatModuleName(module));
        });
      })
    });

    it('Add user template', function () {
      cy.visit(`${Cypress.env("url")}/profile?tab=manageTemplate`)
      cyGet(globalSel.createtestid).contains("Create").click();

      // Fill template name
      butextField(`[data-testid="index-textfield-fm1l89cxe"]`, `label`).contains("Template name");
      butextField(`[data-testid="index-textfield-fm1l89cxe"]`, `input[placeholder="Enter template name"]`)
        .type(uniqueTemplateName);

      // Open dropdown and select pipeline
      budropdown(
        `[data-testid="managepermission-stack-m3in09ace"] > :first`,
        `[data-testid="button-typography-8x5inumxs"]`,
        `Select Pipeline`
      );

      cy.wait("@getPipelines", { timeout: 10000 }).then(({ response }) => {
        const pipelines = response.body.result.values.map(ele => ele.label);
        const firstPipeline = pipelines[0];

        // Search if more than 5 pipelines
        if (pipelines.length > 5) {
          buSearchbox(globalSel.search, firstPipeline);
        }

        budropdownOption(firstPipeline).first().click();

        // Verify ownership permissions UI
        cyGet('[data-testid="ownershiprow-iconbutton-ph6ah241c"]').click();
        cy.contains('thead', 'Permission');
        cy.contains('thead', 'Owner only');
        cy.contains('thead', 'Everything');
        cy.contains('thead', 'Select fields');
        cy.contains('tr', firstPipeline);

        // View permission should be checked and disabled
        cy.contains('tr', 'View')
          .find('input[type="checkbox"]')
          .eq(0)
          .should('be.checked')
          .and('be.disabled');

        // Save
        buSaveButton().click();
      });
    });
  });

  context(`Assign and Edit Template`, function () {
    let userTemplate;
    let user;

    it(`Assign Template to user`, function () {
      cy.visit(`${Cypress.env("url")}/profile?tab=manageUsers`)
      cy.wait("@userGrid", { timeout: 10000 }).then(({ response }) => {
        user = response.body.result.values.find(ele => ele.role === "std")
        if (!user) { this.skip() }
        cy.intercept('GET', `**/crew/users//${user.id}`).as('getUserById');
        cyGet(`[data-testid="activitybar-textfield-8eiuz4v4a"] input`).type(user?.label);
        onesecondWait()
        cy.contains('tr', user?.label).find(`[data-testid="Action"]`).click()
        cyGet("#edit").click({ force: true })
        twosecondWait()
        cy.wait("@getUserById").then(({ response }) => {
          const assignedTemplate = response.body.result.profile.template.label;
          cyGet(`[data-testid="chipinput-iconbutton-ycchky4nm"]`).click()
          cy.wait("@getTempalte", { timeout: 10000 }).then(({ response }) => {
            const totalTemplates = response.body.result.pages.totalRecords
            const templates = response.body.result.values.map(ele => ele.label)
            if (assignedTemplate === "No template") {
              userTemplate = templates[0]
              if (totalTemplates > 5) { buSearchbox(globalSel.search, userTemplate) }
              budropdownOption(userTemplate, `[data-testid="buchip-chip-5r51zm55o"]`).click()
            } else {
              userTemplate = templates.find(ele => ele !== assignedTemplate)
              if (totalTemplates > 5) { buSearchbox(globalSel.search, userTemplate) }
              budropdownOption(userTemplate, `[data-testid="buchip-chip-5r51zm55o"]`).click()
            }
            twosecondWait()
            buSaveButton().click()
            cyGet('.MuiSnackbarContent-message').should("contain.text", "User Permissions Updated")
            logout()
            // cy.clearCookies();
          })
        })

      })
    })

    it('Verify if the standard user has permission to create a record.', () => {
      cy.visit(`${Cypress.env("url")}/profile?tab=manageTemplate`)
      permission(userTemplate).then((permissionResult) => {
        const assignedPipeline = Object.keys(permissionResult.auth.lms.lead.manageRecords);
        const recordPermission = permissionResult.auth.lms.lead.manageRecords[assignedPipeline[0]]
        const create = recordPermission.create
        setPermissionOnRoleSwitch(create, false, "Create", 0);
        // Login with standard user
        cy.login(user?.email);
        cy.visit(`${Cypress.env("lmsUrl")}/leads`);
        cyGet(`[data-testid="Create Lead"]`).should("not.be.disabled");
        logout();
        cy.clearCookies();
      });
    });

    it('Verify if the standard user has permission to import the record.', () => {
      cy.visit(`${Cypress.env("url")}/profile?tab=manageTemplate`)
      permission(userTemplate).then((permissionResult) => {
        const assignedPipeline = Object.keys(permissionResult.auth.lms.lead.manageRecords);
        const recordPermission = permissionResult.auth.lms.lead.manageRecords[assignedPipeline[0]]
        const imp = recordPermission.import;
        setPermissionOnRoleSwitch(imp, false, "Import", 0);
        // Login with standard user
        cy.login(user?.email);
        cy.visit(`${Cypress.env("lmsUrl")}/leads`);
        cyGet(`[data-testid="Import"]`).should("not.be.disabled")
        logout();
        cy.clearCookies();
      });
    });

    it('Verify if the standard user has permission to activity of record.', () => {
      cy.visit(`${Cypress.env("url")}/profile?tab=manageTemplate`)
      permission(userTemplate).then((permissionResult) => {
        const assignedPipeline = Object.keys(permissionResult.auth.lms.lead.manageRecords);
        const recordPermission = permissionResult.auth.lms.lead.manageRecords[assignedPipeline[0]]
        const activity = recordPermission.activity;
        setPermissionOnRoleSwitch(activity, false, "Activity", 0);
        // Login with standard user
        cy.login(user?.email);
        cy.visit(`${Cypress.env("lmsUrl")}/leads`);
        cyGet(`[data-testid="buelementgroup-box-n1f8dc7ag"] [aria-label="Split view"]`).click();
        cyGet(`[data-testid="communicationbar-box-951cbwqi4"]`).find(`[aria-label="Activities"]`);
        logout();
        cy.clearCookies();
      });
    });

    it('Verify if the standard user has permission to Whatsapp.', () => {
      cy.visit(`${Cypress.env("url")}/profile?tab=manageTemplate`)
      permission(userTemplate).then((permissionResult) => {
        const assignedPipeline = Object.keys(permissionResult.auth.lms.lead.manageRecords);
        const recordPermission = permissionResult.auth.lms.lead.manageRecords[assignedPipeline[0]]
        const wa = recordPermission.wa;
        setPermissionOnRoleSwitch(wa, false, "Whatsapp", 0);
        // Login with standard user
        cy.login(user?.email);
        // twosecondWait()
        cy.visit(`${Cypress.env("lmsUrl")}/leads`);
        cyGet(`[data-testid="buelementgroup-box-n1f8dc7ag"] [aria-label="Split view"]`).click();
        cyGet('[data-testid="communicationbar-box-951cbwqi4"]').find(`[aria-label="Whatsapp"]`)
        logout();
        cy.clearCookies();
      });
    });

    it('Verify if the standard user has not permission to create a record.', () => {
      cy.visit(`${Cypress.env("url")}/profile?tab=manageTemplate`)
      permission(userTemplate).then((permissionResult) => {
        const assignedPipeline = Object.keys(permissionResult.auth.lms.lead.manageRecords);
        const recordPermission = permissionResult.auth.lms.lead.manageRecords[assignedPipeline[0]]
        const create = recordPermission.create
        setPermissionOnRoleSwitch(create, true, "Create", 0);
        // Login with standard user
        cy.login(user?.email);
        cy.visit(`${Cypress.env("lmsUrl")}/leads`);
        cyGet(`[data-testid="Create Lead"]`).should("be.disabled");
        logout();
        cy.clearCookies();
      });
    });

    it('Verify if the standard user has not permission to import the record.', () => {
      cy.visit(`${Cypress.env("url")}/profile?tab=manageTemplate`)
      permission(userTemplate).then((permissionResult) => {
        const assignedPipeline = Object.keys(permissionResult.auth.lms.lead.manageRecords);
        const recordPermission = permissionResult.auth.lms.lead.manageRecords[assignedPipeline[0]]
        const imp = recordPermission.import;
        setPermissionOnRoleSwitch(imp, true, "Import", 0);
        // Login with standard user
        cy.login(user?.email);
        cy.visit(`${Cypress.env("lmsUrl")}/leads`);
        cyGet(`[data-testid="Import"]`).should("be.disabled")
        logout();
        cy.clearCookies();
      });
    });
  });



  it.skip('Check system default required field should be already required and should not be changeable  ', () => {
    cy.get('[placeholder="search...."]').type(uniqueTemplateName);
    cy.get('table> tbody').children("tr").contains(uniqueTemplateName).next().click();
    cy.get("#edit").click()
    cy.wait(1000)
    cy.get('input[placeholder="Enter template name"]').clear().type(uniqueTemplateNameupdated);
    cy.get('[role="list"] [type="button"]').click()
    cy.wait('@getPipelines', { timeout: 10000 }).then((interception) => {
      const responseBody = interception.response.body;
      const leadName = responseBody.result.values[0].label;
      cy.get(`${lead.chooseOptions} > :nth-child(2)`).click();
      cy.contains(leadName).click();
      cy.get('[data-testid="recordaccesstable-tablebody-circtrpwp"] > [data-testid="ownershiprow-tablerow-6gy8mx6fe"] > :nth-child(4) > [data-testid="ownershiprow-checkbox-y6wgiibo8"] > .PrivateSwitchBase-input')

      cy.get('[data-testid="ownershiprow-tablecell-jgp2w36xa"] button').eq(1).click();
      cy.wait("@tempFieldsList", { timeout: 10000 }).then(({ response }) => {
        const fieldLabel = response.body.result.values.map((ele) => ele.label);
        const fieldId = response.body.result.values.map((ele) => ele.id);
        cy.log(fieldLabel[0]);
        cy.get('input[placeholder="Search..."]').type(fieldLabel[0])
        cy.get(`[data-rbd-draggable-id="${fieldId[0]}"] > .MuiGrid-root > :nth-child(2) > :nth-child(1) button`).click()
        cy.contains('Required').should('have.class', 'Mui-disabled')
        cy.get('[data-testid="bupopper-dialogactions-0zh9xps0l"]').find('[data-testid="Cancel"]').click();
        cy.get('#send').click();
        cy.get(lead.typeBtn).contains("Save").click();
      });
      // })
    })


  });

  context(`Delete TemPlate functionality`, () => {
    it('Delete Template', () => {
      let msg1 = "Delete template";
      let msg2 = "Are you sure you want to delete this Template ?";
      cy.visit(`${Cypress.env("url")}/profile?tab=manageTemplate`);
      cy.wait("@templateGrid", { timeout: 10000 }).then(({ response }) => {
        const unAssignedTemplate = response.body.result.values.filter(ele => ele.assignedTo.length === 0)
        if (unAssignedTemplate.length > 0) {
          cyGet(`[data-testid="templatelist-textfield-e9dj43sha"] input`).type(unAssignedTemplate[0].label);
          cy.contains('tr', unAssignedTemplate[0].label).find(`[data-testid="Action"]`).click()
          cyGet("#delete").click()
          buCaption(`[role="dialog"]`, `#customized-dialog-title p`, msg1, `[role="dialog"] [data-testid="deletetemplate-typography-5sxlboqg8"]`, msg2)
          cyGet(`[data-testid="Delete"]`).click()
        } else {
          cy.log(`Teplate not available for delete`);
        }
      });
    });

    it('Assigned Tempale should not be delete', () => {
      cy.visit(`${Cypress.env("url")}/profile?tab=manageTemplate`);
      cy.wait("@templateGrid", { timeout: 10000 }).then(({ response }) => {
        const assignedTemplate = response.body.result.values.filter(ele => ele.assignedTo.length > 0)
        if (assignedTemplate.length > 0) {
          cyGet(`[data-testid="templatelist-textfield-e9dj43sha"] input`).type(assignedTemplate[0].label);
          cy.contains('tr', assignedTemplate[0].label).find(`[data-testid="Action"]`).click()
          cy.get("#delete").should("have.attr", "aria-disabled", "true")
        } else {
          cy.log(`Teplate not available for delete`);
        }
      });
    });
  })
});
