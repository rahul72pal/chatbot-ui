import React, { useState } from 'react';
import { FileText, UploadCloud, Search, Trash2, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
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

  // Fetch real documents from MongoDB backend
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

    // Enforce 10 MB file size limit
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(`File size (${fileSizeMB} MB) exceeds the 10 MB limit. Please select a smaller PDF document.`);
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
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
          <CheckCircle className="w-3 h-3 text-emerald-400" /> Indexed
        </span>
      );
    }
    if (status === 'indexing') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-md animate-pulse">
          <Clock className="w-3 h-3 text-indigo-400" /> Indexing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
        <AlertCircle className="w-3 h-3 text-rose-400" /> Failed
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Knowledge Base Documents
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Manage training PDFs indexed in Qdrant Vector Database for RAG context retrieval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Chatbot Filter Dropdown */}
          <select
            value={selectedChatbotId}
            onChange={(e) => setSelectedChatbotId(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Target: All Chatbots</option>
            {chatbots.map((bot) => (
              <option key={bot.id} value={bot.id}>
                Target: {bot.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Upload Zone */}
      <div className={`glass-card border-2 border-dashed rounded-3xl p-8 text-center relative transition-all group ${
        !selectedChatbotId || isUploading
          ? 'border-slate-800/80 bg-slate-900/30 opacity-60'
          : 'border-slate-700/80 hover:border-indigo-500/80 hover:bg-slate-900/60'
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
        <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 transition-transform ${
          !selectedChatbotId 
            ? 'bg-slate-800 text-slate-500 border border-slate-700' 
            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110'
        }`}>
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="font-display font-bold text-base text-white">
          {selectedChatbotId ? 'Click or drag PDF document to upload & index' : 'Document Upload Disabled'}
        </h3>
        <p className={`text-xs mt-1 font-medium ${!selectedChatbotId ? 'text-amber-400/90' : 'text-slate-400'}`}>
          {selectedChatbotId 
            ? 'Will be indexed into the selected chatbot (Max size: 10 MB).' 
            : '⚠️ Please select a target chatbot from the dropdown above to enable document upload.'}
        </p>
      </div>

      {isUploading && (
        <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
          <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
          <div>
            <p className="text-xs font-bold text-indigo-300">Uploading & Indexing into Qdrant Vector Database...</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Your PDF text is being chunked and stored as embeddings.</p>
          </div>
        </div>
      )}

      {/* Search and Table */}
      <section className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-display font-bold text-base text-white">Indexed Files ({filteredDocs.length})</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6 font-bold">Document Name</th>
                <th className="py-4 px-6 font-bold">Size</th>
                <th className="py-4 px-6 font-bold">Status</th>
                <th className="py-4 px-6 font-bold">Vector Chunks</th>
                <th className="py-4 px-6 font-bold">Uploaded Date</th>
                <th className="py-4 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {isDocsLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading knowledge base documents...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white text-xs">{doc.name || doc.filename}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-medium">{doc.size || 'PDF'}</td>
                    <td className="py-4 px-6">{getStatusBadge(doc.status || 'indexed')}</td>
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-indigo-300 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                        {doc.chunks_count || 0} chunks
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recently'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDelete(doc.id, doc.name || doc.filename)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete Document & Vector Embeddings"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No PDF documents found. Select a chatbot and upload a PDF above!
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
