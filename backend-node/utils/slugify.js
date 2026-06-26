/**
 * slugify.js
 *
 * Utility functions for generating URL-friendly and unique slugs.
 */

function slugify(text = '') {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function generateUniqueSlug(Model, title, currentId = null) {

    const baseSlug = slugify(title);

    let slug = baseSlug;
    let counter = 2;

    while (true) {

        const existing = await Model.findOne({
            slug,
            ...(currentId ? { _id: { $ne: currentId } } : {})
        });

        if (!existing) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;

    }

}

module.exports = {
    slugify,
    generateUniqueSlug
};