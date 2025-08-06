import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { Document } from '../types';

export const documentsService = {
  // Subir un documento
  async uploadDocument(file: File, requestId: string, userId: string): Promise<Document> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `requests/${requestId}/documents/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const document: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        uploadedAt: new Date(),
        uploadedBy: userId
      };
      
      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Eliminar un documento
  async deleteDocument(documentUrl: string): Promise<void> {
    try {
      const storageRef = ref(storage, documentUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Obtener el tamaño formateado
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Obtener el icono según el tipo de archivo
  getFileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📋';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  }
};