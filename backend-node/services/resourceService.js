const { generateUniqueSlug }       = require('../utils/slugify');
const { checkDuplicate }           = require('../utils/duplicateChecker');
const LegalResource                = require('../models/LegalResource');
const ResourceVersion              = require('../models/ResourceVersion');
const logger                       = require('../utils/logger');

class ResourceService {

    async list(query = {}, sort = { createdAt: -1 }) {
        return LegalResource.find(query).sort(sort);
    }

    async create(resourceData) {
        const duplicate = await checkDuplicate(LegalResource, resourceData);
        if (duplicate) {
            const err = new Error(`Possible duplicate resource found: "${duplicate.title}"`);
            err.status    = 409;
            err.duplicate = duplicate;
            throw err;
        }

        resourceData.slug = await generateUniqueSlug(LegalResource, resourceData.title);

        try {
            const resource = await LegalResource.create(resourceData);
            return resource;
        } catch (err) {
            if (err.code === 11000 && err.keyPattern?.slug) {
                // Race condition: another concurrent request claimed the same slug.
                // Retry slug generation once with a timestamp suffix.
                resourceData.slug = await generateUniqueSlug(LegalResource, resourceData.title);
                return await LegalResource.create(resourceData);
            }
            throw err;
        }
    }

    async getHistory(id) {
        return ResourceVersion.find({ resourceId: id }).sort({ version: -1 }).limit(50).lean();
    }

    async update(id, resourceData) {
        // Only run duplicate check and slug regeneration when title is present
        // and differs from the current stored title.
        const existing = await LegalResource.findById(id).lean();

        // Snapshot existing state before overwriting
        if (existing) {
            const versionCount = await ResourceVersion.countDocuments({ resourceId: id });
            await ResourceVersion.create({
                resourceId: id,
                version: versionCount + 1,
                snapshot: existing,
                editedBy: resourceData.editedBy || null,
                changeNote: resourceData._changeNote || null
            });
        }
        delete resourceData._changeNote;

        const titleChanged = resourceData.title && existing && resourceData.title !== existing.title;

        if (titleChanged || !existing) {
            const duplicate = await checkDuplicate(LegalResource, resourceData, id);
            if (duplicate) {
                const err = new Error(`Possible duplicate resource found: "${duplicate.title}"`);
                err.status    = 409;
                err.duplicate = duplicate;
                throw err;
            }
        }

        if (titleChanged || (!existing?.slug && resourceData.title)) {
            try {
                resourceData.slug = await generateUniqueSlug(LegalResource, resourceData.title, id);
            } catch (err) {
                if (err.code === 11000) {
                    resourceData.slug = await generateUniqueSlug(LegalResource, resourceData.title, id);
                } else {
                    throw err;
                }
            }
        } else if (existing?.slug) {
            // Preserve existing slug when title unchanged
            resourceData.slug = existing.slug;
        }

        return LegalResource.findByIdAndUpdate(id, resourceData, { new: true, runValidators: true });
    }

    async delete(id) {
        return LegalResource.findByIdAndDelete(id);
    }

    async getById(id) {
        return LegalResource.findById(id);
    }
}

module.exports = new ResourceService();
