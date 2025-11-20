import React, { useState } from 'react';
import { UserProfile, JobMatchResult } from '../types';
import { analyzeJobMatch } from '../services/geminiService';
import { Button } from '../components/Button';
import { CheckCircle, AlertTriangle, ArrowRight, FileText, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface JobMatcherProps {
  profile: UserProfile;
}

export const JobMatcher: React.FC<JobMatcherProps> = ({ profile }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeJobMatch(profile, jobDescription);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze job match.");
    } finally {
      setLoading(false);
    }
  };

  // Transform data for Stacked Bar Chart (Overlap Visualization)
  const overlapData = result ? [
    {
        name: 'Skill Coverage',
        matched: result.sharedSkills.length,
        missing: result.missingSkills.length,
    }
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 print:hidden">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-indigo-600" />
            JD Skill Matcher
          </h2>
          <p className="text-gray-600 mt-2">
            Paste a job description to run the NLP matching algorithm. Calculates TF-IDF/Cosine Similarity score.
          </p>
        </div>

        <div className="space-y-4">
            <textarea
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono resize-none"
                placeholder="Paste job description text here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="flex justify-end">
                <Button onClick={handleMatch} disabled={!jobDescription.trim()} isLoading={loading} size="lg">
                    Calculate Match Score <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up print:border-gray-300 print:shadow-none">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between print:bg-white print:border-b-2">
                <div>
                     <h3 className="text-lg font-bold text-gray-900">Match Analysis Results</h3>
                     <p className="text-xs text-gray-500 font-mono">Job ID: {result.jobId}</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">Similarity Score</span>
                    <span className={`px-4 py-2 rounded-lg text-xl font-bold shadow-sm border ${
                        result.matchScore >= 70 ? 'bg-green-100 text-green-700 border-green-200' : 
                        result.matchScore >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                        'bg-red-100 text-red-700 border-red-200'
                    }`}>
                        {result.matchScore}%
                    </span>
                </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Visualization */}
                <div className="bg-gray-50 rounded-xl p-6 flex flex-col border border-gray-100 print:bg-white print:border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-wider text-center">Skill Overlap Visualization</h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={overlapData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis label={{ value: 'Skill Count', angle: -90, position: 'insideLeft' }} />
                                <RechartsTooltip cursor={{fill: 'transparent'}} />
                                <Legend verticalAlign="bottom" wrapperStyle={{paddingTop: '20px'}} />
                                <Bar dataKey="matched" name="Matched Skills" stackId="a" fill="#4f46e5" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="missing" name="Missing Skills" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm font-medium text-gray-700">
                            {result.sharedSkills.length} Shared / {result.sharedSkills.length + result.missingSkills.length} Total Detected
                        </p>
                    </div>
                </div>

                {/* Middle Column: Matched Skills */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                        <CheckCircle className="text-emerald-600 h-4 w-4" />
                        Shared Features
                    </h4>
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 min-h-[120px]">
                        {result.sharedSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {result.sharedSkills.map(skill => (
                                    <span key={skill} className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-white text-emerald-700 border border-emerald-200 shadow-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No direct skill matches found.</p>
                        )}
                    </div>
                    <div className="mt-6">
                        <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">NLP Analysis</h4>
                        <p className="text-sm text-gray-600 leading-relaxed bg-white p-3 rounded border border-gray-100 italic">
                            "{result.analysis}"
                        </p>
                    </div>
                </div>

                {/* Right Column: Missing Skills */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                        <AlertTriangle className="text-amber-500 h-4 w-4" />
                        Missing Features
                    </h4>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 min-h-[200px]">
                         {result.missingSkills.length > 0 ? (
                            <ul className="space-y-2">
                                {result.missingSkills.map(skill => (
                                    <li key={skill} className="flex items-start gap-2 text-sm text-amber-900 bg-white/50 px-2 py-1 rounded">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                                <CheckCircle size={16} /> Full match detected.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};