import express from 'express';
import { upload } from '../config/cloudinary.js';
import { 
    getDocuments, 
    getDocumentById, 
    createDocument, 
    updateDocument, 
    toggleActive, 
    deleteDocument 
} from '../controllers/documentController.js';

const router = express.Router();

router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.post('/', upload.single('doc_file'), createDocument);
router.put('/:id', upload.single('doc_file'), updateDocument);
router.patch('/:id/toggle', toggleActive);
router.delete('/:id', deleteDocument);

export default router;