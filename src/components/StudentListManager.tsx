// adminaiinterview/src/components/StudentListManager.tsx - COMPLETE FIXED
import React, { useState, useEffect } from 'react';
import {
  Users,
  Download,
  Upload,
  X,
  AlertCircle,
  Trash2,
  CheckCircle,
  RefreshCw,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { studentAPI, Student } from '../services/api';
import {
  downloadSampleStudentExcel,
  parseStudentExcelFile,
  validateStudentExcelStructure
} from '../utils/studentExcelUtils';

interface StudentListManagerProps {
  jobPostId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentListManager({
  jobPostId,
  jobTitle,
  isOpen,
  onClose
}: StudentListManagerProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'upload'>('list');

  // Load students when modal opens
  useEffect(() => {
    if (isOpen && jobPostId) {
      loadStudents();
    }
  }, [isOpen, jobPostId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentAPI.getStudentsByJobPost(jobPostId);
      setStudents(response.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (file: File) => {
    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error('Please upload an Excel file (.xlsx or .xls)');
      }

      // Validate structure
      const isValid = await validateStudentExcelStructure(file);
      if (!isValid) {
        throw new Error('Invalid Excel structure. Please download and use the sample template.');
      }

      // Parse file
      const parsedStudents = await parseStudentExcelFile(file);

      // Add unique studentIds and ensure correct type
      const studentsWithIds: Student[] = parsedStudents.map((s, i) => ({
        studentId: `STU_${Date.now()}_${i}`,
        name: s.name,
        email: s.email,
        phoneNumber: s.phoneNumber,
      }));

      // Upload to server
      const response = await studentAPI.createStudents(jobPostId, studentsWithIds);

      setSuccess(`Successfully uploaded ${response.count} students!`);
      setStudents(response.students || []);
      setViewMode('list');

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to upload students';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceStudents = async (file: File) => {
    if (!confirm('This will replace all existing students. Continue?')) {
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Validate and parse
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error('Please upload an Excel file');
      }

      const isValid = await validateStudentExcelStructure(file);
      if (!isValid) {
        throw new Error('Invalid Excel structure');
      }

      const parsedStudents = await parseStudentExcelFile(file);
      
      // Add unique studentIds and ensure correct type
      const studentsWithIds: Student[] = parsedStudents.map((s, i) => ({
        studentId: `STU_${Date.now()}_${i}`,
        name: s.name,
        email: s.email,
        phoneNumber: s.phoneNumber,
      }));

      // Replace students
      const response = await studentAPI.updateStudents(jobPostId, studentsWithIds);

      setSuccess(`Successfully replaced with ${response.count} students!`);
      setStudents(response.students || []);
      setViewMode('list');

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to replace students');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm('Remove this student?')) return;

    try {
      await studentAPI.deleteStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setSuccess('Student removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove student');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Remove all students from this list? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await studentAPI.deleteStudentsByJobPost(jobPostId);
      setStudents([]);
      setSuccess('All students removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to clear students');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Student List</h2>
              <p className="text-sm text-gray-600">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>View Students ({students.length})</span>
            </div>
          </button>
          <button
            onClick={() => setViewMode('upload')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              viewMode === 'upload'
                ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload/Replace</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* View Mode: List */}
          {viewMode === 'list' && (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Loading students...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No Students Uploaded</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Upload an Excel file to add students to this job post
                  </p>
                  <button
                    onClick={() => setViewMode('upload')}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Students
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {students.length} Student{students.length !== 1 ? 's' : ''}
                    </h3>
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student, index) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.phoneNumber || student.mobile}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <button
                                onClick={() => handleRemoveStudent(student.id!)}
                                className="text-red-600 hover:text-red-700"
                                title="Remove student"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {/* View Mode: Upload */}
          {viewMode === 'upload' && (
            <div className="space-y-6">
              {/* Download Template */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <Download className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Download Template
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download the Excel template, fill in student details (name, email, phone number), and save it.
                    </p>
                    <button
                      onClick={downloadSampleStudentExcel}
                      className="flex items-center space-x-2 bg-white border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Sample Template</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload New */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-start space-x-3">
                  <Upload className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Upload Student List
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {students.length === 0 
                        ? 'Upload your completed Excel file with student details.'
                        : 'This will add new students to the existing list.'}
                    </p>
                    <label
                      htmlFor="upload-students"
                      className={`inline-flex items-center space-x-2 cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span>{uploading ? 'Uploading...' : 'Upload Excel File'}</span>
                    </label>
                    <input
                      id="upload-students"
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleExcelUpload(file);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Replace Existing */}
              {students.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-start space-x-3">
                    <RefreshCw className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Replace Student List
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Replace all {students.length} existing student{students.length !== 1 ? 's' : ''} with a new list. 
                        This will permanently remove the current list.
                      </p>
                      <label
                        htmlFor="replace-students"
                        className={`inline-flex items-center space-x-2 cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors ${
                          uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>{uploading ? 'Replacing...' : 'Replace with New List'}</span>
                      </label>
                      <input
                        id="replace-students"
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleReplaceStudents(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}