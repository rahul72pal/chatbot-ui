import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Database,
  ChevronDown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotApi, documentApi } from '../api';
import { useToast } from '../hooks/useToast';

export const Documents: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedChatbotId, setSelectedChatbotId] = useState('');

  // Fetch chatbots list to allow associating uploads
  const { data: chatbots = [] } = useQuery<any[]>({
    queryKey: ['chatbots'],
    queryFn: () => chatbotApi.getChatbots() as Promise<any[]>,
  });

  // Fetch real documents from backend
  const { data: documents = [], isLoading: isDocsLoading } = useQuery<any[]>({
    queryKey: ['documents', selectedChatbotId],
    queryFn: () => documentApi.getDocuments(selectedChatbotId) as Promise<any[]>,
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => documentApi.uploadDocument(formData),
    onSuccess: () => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Document uploaded and vectors indexed in Qdrant!', 'Upload Complete');
    },
    onError: (err: any) => {
      setIsUploading(false);
      const msg = err.message || 'Failed to upload document.';
      toast.error(msg, 'Upload Failed');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (docId: string) => documentApi.deleteDocument(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Document vectors removed from Qdrant store.', 'Document Deleted');
    },
    onError: (err: any) => {
      const msg = err.message || 'Failed to delete document.';
      toast.error(msg, 'Deletion Failed');
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!selectedChatbotId) {
      alert('Please select a chatbot to associate this document with.');
      return;
    }
    const file = e.target.files[0];

    // Enforce 2 MB file size limit
    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`File size (${fileSizeMB} MB) exceeds the 2 MB limit. Please select a smaller PDF document.`, 'File Too Large');
      e.target.value = '';
      return;
    }

    // Enforce max 2 linked documents per chatbot limit
    const chatbotDocs = documents.filter((d: any) => d.chatbot_id === selectedChatbotId);
    if (chatbotDocs.length >= 2) {
      toast.error('Limit reached: Each chatbot can only be linked to a maximum of 2 documents.', 'Limit Exceeded');
      e.target.value = '';
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('chatbot_id', selectedChatbotId);
    formData.append('file', file);

    uploadMutation.mutate(formData);
  };

  const handleDelete = (docId: string, docName: string) => {
    if (window.confirm(`Are you sure you want to delete "${docName}"? This will permanently delete document metadata and purge vector embeddings from Qdrant DB.`)) {
      deleteMutation.mutate(docId);
    }
  };

  const filteredDocs = documents.filter((d: any) => 
    (d.name || d.filename || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === 'indexed') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#10D6A0]/10 text-[#10D6A0] border border-[#10D6A0]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3 text-[#10D6A0]" /> Indexed
        </span>
      );
    }
    if (status === 'indexing') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
          <Clock className="w-3 h-3 text-indigo-400" /> Indexing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#FB7185]/10 text-[#FB7185] border border-[#FB7185]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3 text-[#FB7185]" /> Failed
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <header className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-600/15 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#142342] border border-[#243653] text-[#C7D2FE] text-[11px] font-semibold">
              RAG Vector Database
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F3F6FF] tracking-tight">
            Knowledge Base Documents
          </h1>
          <p className="text-[#A3B3CF] text-xs sm:text-sm max-w-xl">
            Upload PDF manuals, FAQs, and product knowledge indexed into Qdrant Vector DB for grounded AI responses.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {/* Chatbot Selector */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedChatbotId}
              onChange={(e) => setSelectedChatbotId(e.target.value)}
              className="appearance-none bg-[#101D39] border border-[#1C2C4B] rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-[#F3F6FF] focus:outline-none focus:border-[#4F46E5] cursor-pointer w-full"
            >
              <option value="">Target: All Chatbots</option>
              {chatbots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  Target: {bot.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#71829F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </header>

      {/* Upload Dropzone */}
      <div className={`bg-[#0D1730] border-2 border-dashed rounded-2xl p-8 text-center relative transition-all group ${
        !selectedChatbotId || isUploading
          ? 'border-[#1C2C4B] bg-[#091121]/50 opacity-60'
          : 'border-[#243653] hover:border-[#4F46E5] hover:bg-[#101D39]'
      }`}>
        <input 
          type="file" 
          onChange={handleFileUpload}
          className={`absolute inset-0 opacity-0 w-full h-full ${
            !selectedChatbotId || isUploading ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'
          }`}
          accept=".pdf"
          disabled={isUploading || !selectedChatbotId}
        />
        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 transition-transform ${
          !selectedChatbotId 
            ? 'bg-[#101D39] text-[#71829F] border border-[#1C2C4B]' 
            : 'bg-[#142342] text-indigo-400 border border-[#243653] group-hover:scale-110 shadow-glow-sm'
        }`}>
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="font-display font-bold text-base text-[#F3F6FF]">
          {selectedChatbotId ? 'Click or drag PDF document to upload & index' : 'Select a Chatbot to Enable Upload'}
        </h3>
        <p className={`text-xs mt-1.5 font-medium ${!selectedChatbotId ? 'text-[#FBBF24]' : 'text-[#71829F]'}`}>
          {selectedChatbotId 
            ? 'Documents are processed into chunked vector embeddings (Max file size: 2 MB, max 2 docs per bot).' 
            : '⚠️ Please select a target chatbot from the dropdown above to associate and index documents.'}
        </p>
      </div>

      {isUploading && (
        <div className="flex items-center gap-3 p-4 bg-[#101D39] border border-indigo-500/40 rounded-2xl shadow-lg">
          <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#C7D2FE]">Uploading & Indexing into Qdrant Vector Database...</p>
            <p className="text-[11px] text-[#71829F] mt-0.5">Your PDF text is being chunked and converted to dense vector embeddings.</p>
          </div>
        </div>
      )}

      {/* Indexed Documents Table Card */}
      <section className="bg-[#0D1730] rounded-2xl border border-[#1C2C4B] overflow-hidden shadow-xl">
        <div className="p-5 sm:p-6 border-b border-[#1C2C4B] bg-[#091121] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display font-bold text-base text-[#F3F6FF]">
              Indexed Files ({filteredDocs.length})
            </h2>
            <p className="text-xs text-[#71829F] mt-0.5">Documents providing context during visitor chat conversations.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#71829F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[#1C2C4B] bg-[#091121]/60 text-[#71829F] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-5 font-bold min-w-[200px]">Document Name</th>
                <th className="py-3.5 px-5 font-bold min-w-[90px]">Size</th>
                <th className="py-3.5 px-5 font-bold min-w-[110px]">Status</th>
                <th className="py-3.5 px-5 font-bold min-w-[130px]">Vector Chunks</th>
                <th className="py-3.5 px-5 font-bold min-w-[120px]">Uploaded Date</th>
                <th className="py-3.5 px-5 text-right font-bold min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2C4B] text-xs">
              {isDocsLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#A3B3CF]">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading knowledge base documents...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-[#101D39]/50 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#F3F6FF] text-xs">{doc.name || doc.filename}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-[#A3B3CF] font-medium">{doc.size || 'PDF'}</td>
                    <td className="py-4 px-5">{getStatusBadge(doc.status || 'indexed')}</td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-[11px] font-semibold text-[#C7D2FE] bg-[#101D39] px-2.5 py-1 rounded-md border border-[#1C2C4B]">
                        {doc.chunks_count || 0} chunks
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[#71829F]">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recently'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => handleDelete(doc.id, doc.name || doc.filename)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-[#71829F] hover:text-[#FB7185] hover:bg-[#FB7185]/10 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete Document & Vector Embeddings"
                      >
                        <Trash2 className="w-4 h-4 text-[#FB7185]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#71829F]">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#101D39] border border-[#243653] flex items-center justify-center text-[#71829F]">
                        <Database className="w-6 h-6 text-indigo-400" />
                      </div>
                      <p className="text-xs font-medium text-[#A3B3CF]">
                        No documents found for this selection. Select a chatbot and upload a PDF!
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Documents;
