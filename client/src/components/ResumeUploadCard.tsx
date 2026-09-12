import React, { useState, useRef } from 'react';
import { useUserData } from '../context/UserDataContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  FileText, 
  UploadCloud, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';

export const ResumeUploadCard: React.FC = () => {
  const { activeResume, resumeExtraction, refreshResume, refreshFullProfile } = useUserData();
  const { showToast } = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Review state
  const [selectedSkills, setSelectedSkills] = useState<Record<string, { selected: boolean; proficiency: 'beginner' | 'intermediate' | 'advanced' }>>({});
  const [selectedEducation, setSelectedEducation] = useState<Record<number, boolean>>({});
  const [selectedExperience, setSelectedExperience] = useState<Record<number, boolean>>({});
  const [selectedProjects, setSelectedProjects] = useState<Record<number, boolean>>({});
  const [selectedLinks, setSelectedLinks] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize review selections when modal opens
  const openReviewModal = () => {
    if (!resumeExtraction?.extracted_json) return;
    const json = resumeExtraction.extracted_json;

    const skillsMap: Record<string, { selected: boolean; proficiency: 'beginner' | 'intermediate' | 'advanced' }> = {};
    (json.skills || []).forEach(s => {
      skillsMap[s.name] = { selected: true, proficiency: 'intermediate' };
    });
    setSelectedSkills(skillsMap);

    const eduMap: Record<number, boolean> = {};
    (json.education || []).forEach((_, idx) => { eduMap[idx] = true; });
    setSelectedEducation(eduMap);

    const expMap: Record<number, boolean> = {};
    (json.experience || []).forEach((_, idx) => { expMap[idx] = true; });
    setSelectedExperience(expMap);

    const projMap: Record<number, boolean> = {};
    (json.projects || []).forEach((_, idx) => { projMap[idx] = true; });
    setSelectedProjects(projMap);

    setSelectedLinks(true);
    setIsReviewModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    // Validate client-side
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      setUploadError('Only .pdf and .docx files are permitted.');
      showToast('Only .pdf and .docx files are supported.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      showToast('File exceeds 5MB size limit.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const res = await apiClient.uploadResume(file);
      if (res.success) {
        showToast('CV uploaded and parsed successfully.', 'success');
        await Promise.all([refreshResume(), refreshFullProfile()]);
        // Automatically open extraction review if skills/data extracted
        if (res.extraction?.extracted_json && (
          (res.extraction.extracted_json.skills?.length || 0) > 0 ||
          (res.extraction.extracted_json.education?.length || 0) > 0
        )) {
          openReviewModal();
        }
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload CV.');
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyExtraction = async () => {
    if (!activeResume || !resumeExtraction?.extracted_json) return;
    setIsApplying(true);
    try {
      const json = resumeExtraction.extracted_json;

      const accepted_skills = Object.entries(selectedSkills)
        .filter(([_, v]) => v.selected)
        .map(([name, v]) => ({ name, proficiency: v.proficiency }));

      const accepted_education = (json.education || [])
        .filter((_, idx) => selectedEducation[idx])
        .map(edu => ({ institution: edu.institution, degree: edu.degree, major: edu.major || 'Computer Science', year: edu.year }));

      const accepted_experience = (json.experience || [])
        .filter((_, idx) => selectedExperience[idx])
        .map(exp => ({ organization: exp.organization, role: exp.role, description: exp.description }));

      const accepted_projects = (json.projects || [])
        .filter((_, idx) => selectedProjects[idx])
        .map(proj => ({ name: proj.name, description: proj.description }));

      const accepted_links = selectedLinks ? json.links : undefined;

      await apiClient.reviewResumeExtraction(activeResume.id, {
        accepted_skills,
        accepted_education,
        accepted_experience,
        accepted_projects,
        accepted_links
      });

      showToast('Confirmed CV details applied to your profile.', 'success');
      setIsReviewModalOpen(false);
      await Promise.all([refreshResume(), refreshFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to apply extracted items.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!activeResume) return;
    if (!window.confirm('Are you sure you want to remove your active CV? Your confirmed profile skills will not be affected.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiClient.deleteResume(activeResume.id);
      showToast('Resume removed successfully.', 'success');
      await Promise.all([refreshResume(), refreshFullProfile()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to remove resume.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Active Resume Display */}
      {activeResume ? (
        <Card className="p-6 border-slate-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                    {activeResume.original_filename}
                  </h3>
                  <Badge variant="success">Active CV</Badge>
                  <span className="text-xs text-slate-400 font-medium">
                    v{activeResume.version}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>Size: {formatFileSize(activeResume.file_size)}</span>
                  <span>•</span>
                  <span>Uploaded: {new Date(activeResume.upload_date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Zero-IDOR Protected
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {resumeExtraction && resumeExtraction.extracted_json && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openReviewModal}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Review Extractions
                </Button>
              )}

              <a
                href={`/api/resume/${activeResume.id}/download`}
                download
                className="inline-flex"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5 text-slate-600" />}
                >
                  Download
                </Button>
              </a>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
              >
                Replace
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteResume}
                isLoading={isDeleting}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Quick summary of extraction */}
          {resumeExtraction?.extracted_json && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">Detected from CV:</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                  {resumeExtraction.extracted_json.skills?.length || 0} skills
                </span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                  {resumeExtraction.extracted_json.education?.length || 0} education records
                </span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                  {resumeExtraction.extracted_json.experience?.length || 0} experience records
                </span>
              </div>
              <button
                type="button"
                onClick={openReviewModal}
                className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                Review and apply changes <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </Card>
      ) : (
        /* Upload Dropzone */
        <Card
          className={`p-8 border-2 border-dashed transition-all text-center ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/50' 
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Upload your Student CV or Resume
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Drag and drop your document here, or browse from your computer. Supported formats: PDF, DOCX (Max 5MB).
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Browse Resume File
            </Button>

            {uploadError && (
              <p className="text-xs text-red-600 font-medium flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {uploadError}
              </p>
            )}

            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Private & Encrypted Storage
              </span>
              <span>•</span>
              <span>Zero AI Slop Extraction</span>
            </div>
          </div>
        </Card>
      )}

      {/* Assisted Extraction Review Modal */}
      {isReviewModalOpen && resumeExtraction?.extracted_json && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Review Extracted CV Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify information identified from your document before adding it to your profile.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Assisted Verification:</strong> We never overwrite your existing profile records automatically. Select which items you want to merge, verify proficiency levels, and click <em>Apply to Profile</em>.
                </span>
              </div>

              {/* 1. Skills Extracted */}
              {resumeExtraction.extracted_json.skills?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Technical Skills Identified</span>
                      <span className="text-xs font-normal text-slate-500">({resumeExtraction.extracted_json.skills.length})</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = Object.values(selectedSkills).every(s => s.selected);
                        setSelectedSkills(prev => {
                          const next = { ...prev };
                          Object.keys(next).forEach(k => { next[k].selected = !allSelected; });
                          return next;
                        });
                      }}
                      className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Toggle All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {resumeExtraction.extracted_json.skills.map((s) => {
                      const current = selectedSkills[s.name] || { selected: false, proficiency: 'intermediate' };
                      return (
                        <div
                          key={s.name}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                            current.selected 
                              ? 'border-blue-300 bg-blue-50/40' 
                              : 'border-slate-200 bg-slate-50 opacity-60'
                          }`}
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={current.selected}
                              onChange={(e) => {
                                setSelectedSkills(prev => ({
                                  ...prev,
                                  [s.name]: { ...current, selected: e.target.checked }
                                }));
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <div className="font-semibold text-xs text-slate-900">{s.name}</div>
                              <div className="text-[10px] text-slate-400">{s.category}</div>
                            </div>
                          </label>

                          {current.selected && (
                            <select
                              value={current.proficiency}
                              onChange={(e) => {
                                const prof = e.target.value as 'beginner' | 'intermediate' | 'advanced';
                                setSelectedSkills(prev => ({
                                  ...prev,
                                  [s.name]: { ...current, proficiency: prof }
                                }));
                              }}
                              className="text-xs border border-slate-200 rounded-lg bg-white px-2 py-1 text-slate-700 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Education Extracted */}
              {resumeExtraction.extracted_json.education?.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900">Education Detected</h4>
                  <div className="space-y-2">
                    {resumeExtraction.extracted_json.education.map((edu, idx) => (
                      <label
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer ${
                          selectedEducation[idx] ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-slate-50 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedEducation[idx]}
                          onChange={(e) => setSelectedEducation(prev => ({ ...prev, [idx]: e.target.checked }))}
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <div className="text-xs">
                          <div className="font-semibold text-slate-900">{edu.degree}</div>
                          <div className="text-slate-500">{edu.institution} {edu.major ? `• ${edu.major}` : ''}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Links Extracted */}
              {(resumeExtraction.extracted_json.links.github || resumeExtraction.extracted_json.links.linkedin || resumeExtraction.extracted_json.links.portfolio) && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900">Social & Portfolio Links</h4>
                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer ${
                    selectedLinks ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedLinks}
                      onChange={(e) => setSelectedLinks(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div className="text-xs space-y-1">
                      {resumeExtraction.extracted_json.links.github && (
                        <div><strong>GitHub:</strong> {resumeExtraction.extracted_json.links.github}</div>
                      )}
                      {resumeExtraction.extracted_json.links.linkedin && (
                        <div><strong>LinkedIn:</strong> {resumeExtraction.extracted_json.links.linkedin}</div>
                      )}
                      {resumeExtraction.extracted_json.links.portfolio && (
                        <div><strong>Portfolio:</strong> {resumeExtraction.extracted_json.links.portfolio}</div>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleApplyExtraction}
                isLoading={isApplying}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Apply Confirmed Items to Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
