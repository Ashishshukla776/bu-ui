export const loanTypeRequiredFields = {
    "Personal Loan": [
        "ID Proof", "Address Proof", "Income Proof", "Photograph", "Employment Details",
        "Credit Report", "Other Income Proof", "Guarantor Details", "Business Proof", "Property Documents"
    ],
    "Business Loan": [
        "ID Proof", "Address Proof", "Income Proof", "Photograph", "Business Proof",
        "Business Financials", "Business Plan", "Bank Statement", "Collateral Documents",
        "Security Agreement", "Co-Applicant's Financials", "Property Documents"
    ]
};

export const getRequiredFieldsByLoanType = (allFields, loanType) => {
    const requiredLabels = loanTypeRequiredFields[loanType];
    return allFields.filter(field => requiredLabels.includes(field.label));
};

