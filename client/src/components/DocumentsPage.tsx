import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Eye, Calendar, CheckCircle, 
  AlertCircle, Loader, ChevronLeft, ExternalLink,
  FileCheck, BookOpen, Clipboard, Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DocumentFile {
  id: string;
  fileName: string;
  displayName: string;
  fileType: string;
  description: string;
  size: number;
  uploadedAt: string;
  downloadUrl: string;
  downloadCount: number;
  lastDownloaded?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DocumentsPageProps {
  customerEmail: string;
  onBack?: () => void;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ customerEmail, onBack }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDocuments();
  }, [customerEmail]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/documents/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to load documents');
      }

      const data = await response.json();
      
      // Map documents with appropriate icons
      const documentsWithIcons = data.documents.map((doc: any) => ({
        ...doc,
        icon: getDocumentIcon(doc.fileType)
      }));
      
      setDocuments(documentsWithIcons);
    } catch (error) {
      console.error('Documents loading error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentIcon = (fileType: string) => {
    switch (fileType) {
      case 'form_6765':
        return FileText;
      case 'technical_narrative':
        return BookOpen;
      case 'qre_workbook':
        return Clipboard;
      case 'compliance_memo':
        return Shield;
      case 'recordkeeping_checklist':
        return FileCheck;
      default:
        return FileText;
    }
  };

  const handleDownload = async (document: DocumentFile) => {
    try {
      setDownloadingFiles(prev => new Set(prev.add(document.id)));
      
      // Track download in Airtable
      const trackResponse = await fetch('/api/documents/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerEmail,
          documentId: document.id,
          fileName: document.fileName,
          fileType: document.fileType
        }),
      });

      if (!trackResponse.ok) {
        console.warn('Failed to track download');
      }

      // Open download in new window/tab
      window.open(document.downloadUrl, '_blank');
      
      // Update local download count
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, downloadCount: doc.downloadCount + 1, lastDownloaded: new Date().toISOString() }
          : doc
      ));

      toast({
        title: 'Download Started',
        description: `${document.displayName} download has started`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(document.id);
        return newSet;
      });
    }
  };

  const handlePreview = (document: DocumentFile) => {
    // Open document in new tab for preview
    window.open(document.downloadUrl, '_blank');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
              <p className="text-gray-600">Download your completed R&D tax credit documentation</p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="p-8">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Available</h3>
            <p className="text-gray-600 mb-4">Your documents will appear here once they have been generated.</p>
            <p className="text-sm text-gray-500">Complete the document generation process to see your files here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
            <p className="text-gray-600">Download your completed R&D tax credit documentation</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{documents.length}</div>
              <div className="text-xs text-gray-600">Total Documents</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {documents.reduce((sum, doc) => sum + doc.downloadCount, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
              </div>
              <div className="text-xs text-gray-600">Total Size</div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="p-6 space-y-4">
        {documents.map((document) => {
          const DocumentIcon = document.icon;
          const isDownloading = downloadingFiles.has(document.id);
          
          return (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <DocumentIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {document.displayName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {document.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Uploaded: {formatDate(document.uploadedAt)}
                        </span>
                        <span>{formatFileSize(document.size)}</span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {document.downloadCount} downloads
                        </span>
                        {document.lastDownloaded && (
                          <span>
                            Last: {formatDate(document.lastDownloaded)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreview(document)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Preview document"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                    
                    <button
                      onClick={() => handleDownload(document)}
                      disabled={isDownloading}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isDownloading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Information */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Notes</p>
              <ul className="space-y-1 text-xs">
                <li>• Keep these documents secure and backed up for IRS records</li>
                <li>• Forms should be filed with your tax return by the appropriate deadline</li>
                <li>• Downloads are tracked for compliance and audit purposes</li>
                <li>• Contact support if you need updated versions of any documents</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;