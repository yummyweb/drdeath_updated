# PDF Document & External Link Upload Feature

## Overview
Added support for uploading PDF documents and external links to Stories and Cases.

## Backend Implementation ✅

### Database Schema Updates
- **Story Model**: Added `documents` and `external_links` arrays
- **Case Model**: Added `documents` and `external_links` arrays

### New API Endpoints

#### Stories (User + Admin)
- `POST /api/stories/:storyId/document` - Upload PDF document
- `POST /api/stories/:storyId/link` - Add external link
- `DELETE /api/stories/:storyId/document/:documentUrl` - Delete document
- `DELETE /api/stories/:storyId/link/:linkIndex` - Delete link

#### Stories (Admin Only)
- `POST /api/admin/stories/:storyId/document` - Upload PDF (bypass ownership)
- `POST /api/admin/stories/:storyId/link` - Add link (bypass ownership)

#### Cases (Admin Only)
- `POST /api/cases/:caseId/document` - Upload PDF document
- `POST /api/cases/:caseId/link` - Add external link
- `DELETE /api/cases/:caseId/document/:documentUrl` - Delete document
- `DELETE /api/cases/:caseId/link/:linkIndex` - Delete link

### File Storage
- Documents stored in: `public/uploads/documents/stories/` and `public/uploads/documents/cases/`
- Files accessible at: `/uploads/documents/stories/{filename}` and `/uploads/documents/cases/{filename}`
- PDF file size limit: 50MB
- Documents include: filename, URL, title, uploaded_at timestamp

### External Links Structure
```javascript
{
  title: String,    // Display name (e.g., "LinkedIn Post", "Judgment Copy")
  url: String,      // Full URL
  type: String      // 'linkedin', 'petition', 'judgment', 'other'
}
```

## Frontend Implementation (TODO)

### Components Needed

1. **PDF Viewer Component** (`components/PDFViewer.js`)
   - Scrollable PDF viewer
   - Use `<iframe>` or PDF.js library
   - Display: `src={backendUrl + documentUrl}`

2. **Document Upload UI** (Add to EditStory and Cases)
   - File input for PDF upload
   - Input field for document title
   - List of uploaded documents with delete button
   - Upload button

3. **External Link Manager** (Add to EditStory and Cases)
   - Form with fields: Title, URL, Type (dropdown)
   - List of existing links with delete button
   - Add link button

### Pages to Update

#### 1. EditStory.js
- Add "Documents" section
- Add "External Links" section
- Show existing documents/links
- Allow adding/removing

#### 2. StoryDetail.js
- Display documents section with PDF viewer
- Display external links section with icons/badges
- Show LinkedIn icon for LinkedIn links

#### 3. Cases Management (Admin)
- Add document/link upload to case edit/create form
- Display documents/links in case detail view

#### 4. SubmitStory.js
- Add document upload section
- Add external link section

### Example Frontend Code Structure

```javascript
// In EditStory.js or SubmitStory.js
const [documents, setDocuments] = useState([]);
const [externalLinks, setExternalLinks] = useState([]);
const [uploadingDoc, setUploadingDoc] = useState(false);

// Upload PDF
const handleDocumentUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', documentTitle);
  
  setUploadingDoc(true);
  try {
    const endpoint = isAdmin 
      ? `${API}/admin/stories/${id}/document`
      : `${API}/stories/${id}/document`;
    const res = await axios.post(endpoint, formData, {
      ...getAuthHeader(),
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setDocuments([...documents, res.data.document]);
  } catch (error) {
    toast.error('Failed to upload document');
  } finally {
    setUploadingDoc(false);
  }
};

// Add External Link
const handleAddLink = async () => {
  try {
    const endpoint = isAdmin
      ? `${API}/admin/stories/${id}/link`
      : `${API}/stories/${id}/link`;
    const res = await axios.post(endpoint, {
      title: linkTitle,
      url: linkUrl,
      type: linkType
    }, getAuthHeader());
    setExternalLinks([...externalLinks, res.data.link]);
  } catch (error) {
    toast.error('Failed to add link');
  }
};
```

### PDF Viewer Component Example

```javascript
// components/PDFViewer.js
import React from 'react';

const PDFViewer = ({ url, title }) => {
  const fullUrl = `${process.env.REACT_APP_BACKEND_URL}${url}`;
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-slate-100 p-2 border-b">
        <h4 className="font-medium">{title}</h4>
      </div>
      <iframe
        src={fullUrl}
        className="w-full"
        style={{ height: '600px' }}
        title={title}
      />
    </div>
  );
};
```

### Display in StoryDetail.js

```javascript
{story.documents && story.documents.length > 0 && (
  <section className="mt-8">
    <h2 className="font-serif text-2xl font-bold mb-4">Documents</h2>
    <div className="space-y-4">
      {story.documents.map((doc, idx) => (
        <PDFViewer key={idx} url={doc.url} title={doc.title} />
      ))}
    </div>
  </section>
)}

{story.external_links && story.external_links.length > 0 && (
  <section className="mt-8">
    <h2 className="font-serif text-2xl font-bold mb-4">Related Links</h2>
    <div className="space-y-2">
      {story.external_links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          {link.type === 'linkedin' && <LinkedinIcon />}
          {link.title}
          <ExternalLink className="h-4 w-4" />
        </a>
      ))}
    </div>
  </section>
)}
```

## Testing Checklist

- [ ] Upload PDF to story (user)
- [ ] Upload PDF to story (admin)
- [ ] Add external link to story (user)
- [ ] Add external link to story (admin)
- [ ] Delete document from story
- [ ] Delete link from story
- [ ] View PDF in StoryDetail page
- [ ] View external links in StoryDetail page
- [ ] Upload PDF to case (admin only)
- [ ] Add link to case (admin only)
- [ ] Display documents/links in cases view

## Notes

- PDFs are stored as files (not Base64) to avoid database bloat
- External links support LinkedIn, petitions, judgments, and other types
- Admin can manage documents/links for any story
- Users can only manage documents/links for their own stories
- Documents include title for better organization
- Link types help categorize different link types (LinkedIn, petitions, etc.)

---

**Status**: Backend ✅ Complete | Frontend ⏳ Pending Implementation
