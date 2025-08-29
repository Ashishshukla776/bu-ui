const defaultSpecPattern = [
    'cypress/e2e/auth/**',
    'cypress/e2e/one/**',
    'cypress/e2e/lms/setting/1_pipeline/*',
    'cypress/e2e/lms/setting/2_manageField/*',
    'cypress/e2e/lms/lead/1_headers/*',
    'cypress/e2e/lms/lead/2_fields/*',
    'cypress/e2e/lms/lead/3_records/*',
    'cypress/e2e/lms/lead/4_tools/*',
    'cypress/e2e/lms/lead/5_biztab/*',
    'cypress/e2e/lms/lead/5_customForm/*',
    'cypress/e2e/lms/lead/6_bulkAction/*',
    'cypress/e2e/lms/lead/7_views/*',
    'cypress/e2e/lms/setting/9_bin/*',
]

const dsaSpecPattern = [
    'cypress/e2e/dsa/referrers/*',
    'cypress/e2e/dsa/partnerBanks/*',
    'cypress/e2e/dsa/loanEnquiry/*',
    'cypress/e2e/dsa/loanRequest/*',
    // 'cypress/e2e/dsa/referrers/*',
]

module.exports = { defaultSpecPattern, dsaSpecPattern }