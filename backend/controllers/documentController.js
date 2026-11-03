import Document from '../models/Document.js';

export const getDocuments = async (req, res) => {
    try {
        const docs = await Document.find().sort({ createdAt: -1 });
        const total = docs.length;
        const active = docs.filter(d => d.isActive).length;
        const hidden = total - active;
        res.json({ success: true, total, active, hidden, data: docs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDocumentById = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createDocument = async (req, res) => {
    try {
        let filePath = '';
        if (req.file) {
            filePath = req.file.path; // Cloudinary secure URL
        }

        const newDoc = new Document({
            orgName: req.body.org_name,
            nationalNum: req.body.national_num,
            memberNum: req.body.member_num,
            docNum: req.body.doc_num,
            status: req.body.status || 'مصدقة',
            filePath,
            isActive: true
        });

        await newDoc.save();
        res.json({ success: true, message: 'Record added successfully', data: newDoc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDocument = async (req, res) => {
    try {
        const updateData = {
            orgName: req.body.org_name,
            nationalNum: req.body.national_num,
            memberNum: req.body.member_num,
            docNum: req.body.doc_num,
            status: req.body.status
        };

        if (req.file) {
            updateData.filePath = req.file.path;
        }

        const updated = await Document.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, message: 'Updated successfully', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleActive = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

        doc.isActive = !doc.isActive;
        await doc.save();
        res.json({ success: true, message: 'Status toggled', data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        await Document.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};