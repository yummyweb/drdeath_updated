const Grant = require('../models/Grant');

async function create(userId, userName, userEmail, data) {
  const {
    case_summary, case_type, opponent_details, current_stage,
    annual_income, family_members, other_income_sources,
    amount_required, purpose_of_funding, breakdown_of_costs,
    bank_account_name, bank_account_number, bank_ifsc
  } = data;

  return Grant.create({
    user_id: userId, user_name: userName, user_email: userEmail,
    case_summary, case_type, opponent_details, current_stage,
    annual_income, family_members, other_income_sources,
    amount_required, purpose_of_funding, breakdown_of_costs,
    bank_account_name, bank_account_number, bank_ifsc,
    status: 'pending'
  });
}

async function getByUser(userId) {
  return Grant.find({ user_id: userId }).sort({ created_at: -1 }).limit(50);
}

async function addDocument(grantId, userId, file, title) {
  const grant = await Grant.findOne({ id: grantId, user_id: userId });
  if (!grant) return null;

  const documentUrl = `/uploads/documents/grants/${file.filename}`;
  grant.supporting_documents = grant.supporting_documents || [];
  grant.supporting_documents.push({
    filename: file.originalname,
    url: documentUrl,
    title: title || file.originalname,
    uploaded_at: new Date()
  });
  await grant.save();
  return grant.supporting_documents[grant.supporting_documents.length - 1];
}

module.exports = { create, getByUser, addDocument };
