const { faker } = require('@faker-js/faker')
const lead = require('../selector/lead')

export const modules = {
    lms: 'Lead Management',
    crm: "CRM",
    apr: "Approval",
    buForms: "Buopso Forms",
    taskManagement: "Task Management",
    invoice: "Invoice"
};

export const method = {
    get: "GET",
    post: "POST",
    pat: "PATCH",
    put: "PUT",
    del: "DELETE"
}
