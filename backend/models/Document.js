import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    orgName: { type: String, required: true },
    nationalNum: { type: String, required: true },
    memberNum: { type: String, required: true },
    docNum: { type: String, required: true },
    status: { type: String, default: 'مصدقة' },
    filePath: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);