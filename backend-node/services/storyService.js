const path = require('path');
const fs = require('fs');
const Story = require('../models/Story');

const UPLOADS_ROOT = path.resolve(path.join(__dirname, '..', 'public', 'uploads'));

function resolveUploadPath(urlPath) {
  return path.resolve(path.join(__dirname, '..', 'public', urlPath.replace('/uploads/', 'uploads/')));
}

function safeUnlink(urlPath) {
  const fp = resolveUploadPath(urlPath);
  if (fp.startsWith(UPLOADS_ROOT) && fs.existsSync(fp)) {
    fs.unlinkSync(fp);
  }
}

async function create(userId, userName, data) {
  const { title, incident_date, hospital_name, location, description, outcome } = data;
  return Story.create({ user_id: userId, user_name: userName, title, incident_date, hospital_name, location, description, outcome });
}

async function update(storyId, userId, data) {
  const story = await Story.findOne({ id: storyId, user_id: userId });
  if (!story) return null;

  const { title, incident_date, hospital_name, location, description, outcome } = data;
  if (title) story.title = title;
  if (incident_date) story.incident_date = incident_date;
  if (hospital_name) story.hospital_name = hospital_name;
  if (location) story.location = location;
  if (description) story.description = description;
  if (outcome !== undefined) story.outcome = outcome;

  story.status = 'pending';
  await story.save();
  return story;
}

async function remove(storyId, userId) {
  const story = await Story.findOne({ id: storyId, user_id: userId });
  if (!story) return false;

  for (const imageUrl of (story.images || [])) safeUnlink(imageUrl);
  for (const doc of (story.documents || [])) safeUnlink(doc.url);

  await Story.deleteOne({ id: storyId });
  return true;
}

async function addImage(storyId, userId, filename) {
  const story = await Story.findOne({ id: storyId, user_id: userId });
  if (!story) return null;

  const imageUrl = `/uploads/images/stories/${filename}`;
  story.images = story.images || [];
  story.images.push(imageUrl);
  await story.save();
  return story;
}

async function addDocument(storyId, userId, file, title) {
  const story = await Story.findOne({ id: storyId, user_id: userId });
  if (!story) return null;

  const documentUrl = `/uploads/documents/stories/${file.filename}`;
  story.documents = story.documents || [];
  story.documents.push({ filename: file.originalname, url: documentUrl, title: title || file.originalname, uploaded_at: new Date() });
  await story.save();
  return story.documents[story.documents.length - 1];
}

async function removeDocument(storyId, userId, documentUrl) {
  const story = await Story.findOne({ id: storyId, user_id: userId });
  if (!story) return null;

  story.documents = (story.documents || []).filter(d => d.url !== documentUrl);
  safeUnlink(documentUrl);
  await story.save();
  return story;
}

async function addLink(storyId, userId, { title, url, type }) {
  const story = await Story.findOne({ id: storyId, user_id: userId });
  if (!story) return null;

  story.external_links = story.external_links || [];
  story.external_links.push({ title, url, type: type || 'other' });
  await story.save();
  return story.external_links[story.external_links.length - 1];
}

async function removeLink(storyId, userId, linkIndex) {
  const story = await Story.findOne({ id: storyId, user_id: userId });
  if (!story) return null;

  if (story.external_links && story.external_links[linkIndex]) {
    story.external_links.splice(linkIndex, 1);
    await story.save();
  }
  return story;
}

async function getById(storyId) {
  return Story.findOne({ id: storyId });
}

async function getByUser(userId) {
  return Story.find({ user_id: userId }).sort({ created_at: -1 }).limit(100);
}

async function getApproved() {
  return Story.find({ status: 'approved' }).sort({ created_at: -1 }).limit(100);
}

module.exports = { create, update, remove, addImage, addDocument, removeDocument, addLink, removeLink, getById, getByUser, getApproved };
