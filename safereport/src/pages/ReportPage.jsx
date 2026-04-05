import { useState } from 'react';
import ReportForm from '../components/ReportForm';
import { useReports } from '../hooks/useReports';
import { useToast } from '../components/Toast';

export default function ReportPage() {
  const { addReport } = useReports();
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const result = await addReport(data);
    setSubmitting(false);

    if (result.success) {
      setReferenceId(result.referenceId);
      setSubmitted(true);
      showToast('Report submitted anonymously', 'success');
    } else {
      showToast(result.error || 'Failed to submit report', 'error');
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setReferenceId('');
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-5 pb-4 border-b border-brd flex-shrink-0 bg-bg">
        <h1 className="font-serif text-[22px] text-txt font-normal">Report an Incident</h1>
        <p className="text-[12px] text-txt-3 mt-0.5">Your identity is never stored, logged, or transmitted</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        {submitted ? (
          <div className="max-w-[480px] mx-auto">
            <div className="bg-bg-2 border border-success/25 rounded-card p-10 text-center fade-up">
              <div className="w-[60px] h-[60px] rounded-full bg-success-bg border-2 border-success/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-[26px] h-[26px] text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="font-serif text-[20px] text-txt mb-2">Report submitted</div>
              <div className="text-[13px] text-txt-2 leading-relaxed max-w-[300px] mx-auto">
                Your report has been recorded anonymously and will appear on the safety map to help others in your area.
              </div>
              <div className="mt-4">
                Reference ID: <span className="font-mono bg-bg-3 px-2 py-0.5 rounded-md text-[13px] text-gold">{referenceId}</span>
              </div>
              <button
                onClick={handleReset}
                className="mt-5 px-5 py-2 bg-bg-3 text-txt-2 border border-brd-2 rounded-btn text-[12.5px] font-medium hover:bg-bg-4 hover:text-txt transition-all"
              >
                Submit another report
              </button>
            </div>
          </div>
        ) : (
          <ReportForm onSubmit={handleSubmit} submitting={submitting} />
        )}
      </div>
    </div>
  );
}
