import React, { useState, useEffect } from 'react';
import { UserProfile, CareerRecommendation } from '../types';
import { getCareerRecommendations } from '../services/geminiService';
import { Button } from '../components/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Briefcase, CheckCircle, AlertCircle, BookOpen, ExternalLink, ChevronDown, ChevronUp, Download, TrendingUp, Printer, GraduationCap } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCareerRecommendations(profile);
        setRecommendations(data);
        if (data.length > 0) {
            setExpandedId(data[0].id); // Open first by default
        }
      } catch (err) {
        setError("Failed to load recommendations. Please check your API key.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]); 

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExport = () => {
    window.print();
  };

  const isStudent = profile.userType === 'student';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">
            {isStudent ? 'Analyzing Potential Pathways...' : 'Calculating Skill Gaps & Upgrades...'}
        </h2>
        <p className="text-gray-500">Analyzing {profile.skills.length} feature vectors and computing SHAP values...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
            <h3 className="text-red-800 font-semibold text-lg mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Retry</Button>
        </div>
    )
  }

  // Data for chart
  const chartData = recommendations.map(rec => ({
    name: rec.title.split(' ').slice(0, 2).join(' '), // Shorten name
    score: rec.matchScore,
    fullTitle: rec.title
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             {isStudent ? <GraduationCap className="text-indigo-600" size={24} /> : <Briefcase className="text-teal-600" size={24} />}
             <h2 className="text-3xl font-bold text-gray-900">
                 {isStudent ? 'Career Pathway Report' : 'Skill Gap & Upgrade Report'}
             </h2>
          </div>
          <p className="text-gray-600 mt-1">
            Analysis for: <span className="font-semibold text-indigo-600">{profile.fullName}</span> • <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">{profile.currentTitle}</span>
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
             <Button variant="outline" onClick={handleExport}>
                <Printer size={16} className="mr-2" />
                Export as PDF
             </Button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 break-inside-avoid print:border-gray-300 no-break">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={20} />
            {isStudent ? 'Best Fit Probabilities' : 'Promotion/Lateral Move Fit Scores'}
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fill: '#4b5563'}} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={30}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#4f46e5' : entry.score > 60 ? '#0d9488' : '#fbbf24'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center print:hidden">Scores represent the model's confidence (0-100) in the career fit.</p>
      </div>

      {/* Recommendations List */}
      <div className="grid gap-8">
        {recommendations.map((rec) => (
          <div 
            key={rec.id} 
            className={`bg-white rounded-xl border break-inside-avoid no-break transition-all duration-200 overflow-hidden ${expandedId === rec.id ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100' : 'border-gray-200 shadow-sm hover:shadow-md'} print:border-gray-300 print:shadow-none print:ring-0`}
          >
            {/* Card Header */}
            <div 
                className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                onClick={() => toggleExpand(rec.id)}
            >
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${rec.matchScore > 80 ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-100 text-teal-600'} print:bg-gray-100 print:text-black print:border print:border-gray-300`}>
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{rec.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Score: <span className={`font-bold ${rec.matchScore > 80 ? 'text-indigo-600' : 'text-teal-600'}`}>{rec.matchScore}</span></span>
                            <span className="print:hidden">•</span>
                            <span className="print:ml-2">Est. Salary: ${rec.salaryRange.min.toLocaleString()} - ${rec.salaryRange.max.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end md:self-center print:hidden">
                     <span className="text-sm font-medium text-gray-500 hidden md:block">{expandedId === rec.id ? 'Hide Analysis' : 'View Analysis'}</span>
                    {expandedId === rec.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>
            </div>

            {/* Expanded Details - Always shown on print via CSS print:block */}
            <div className={`${expandedId === rec.id ? 'block' : 'hidden print:block'} px-6 pb-6 border-t border-gray-100 bg-gray-50/50 print:bg-white`}>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Left Column: Description & Skills */}
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm print:shadow-none">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                    {isStudent ? 'Why this matches you (SHAP)' : 'Qualifying Experience (SHAP)'}
                                </h4>
                                <ul className="space-y-2">
                                    {rec.reasoning.map((r, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Skill Gap Analysis</h4>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded mb-2 inline-block border border-emerald-100">
                                            {isStudent ? 'Your Existing Strengths' : 'Transferable Skills'}
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.sharedSkills.map(skill => (
                                                <span key={skill} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md flex items-center shadow-sm print:shadow-none">
                                                    <CheckCircle size={10} className="mr-1 text-emerald-500" /> {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded mb-2 inline-block border border-amber-100">
                                            {isStudent ? 'Recommended Curriculum / Skills' : 'Required Upgrades for Role'}
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.missingSkills.map(skill => (
                                                <span key={skill} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md flex items-center shadow-sm print:shadow-none">
                                                    <AlertCircle size={10} className="mr-1 text-amber-500" /> {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Resources */}
                        <div className="break-inside-avoid">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                {isStudent ? 'Learning Path' : 'Upskilling Resources'}
                            </h4>
                            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 print:border-gray-300">
                                {rec.learningResources.map((res, idx) => (
                                    <div key={idx} className="p-3 hover:bg-gray-50 transition-colors flex items-start gap-3 print:hover:bg-white">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded shrink-0 print:border print:border-gray-200">
                                            <BookOpen size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{res.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{res.type}</span>
                                                <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 print:hidden">
                                                    Start Learning <ExternalLink size={10} />
                                                </a>
                                                <span className="hidden print:inline text-xs text-gray-400 font-mono ml-1">{res.url}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-gray-400 text-xs pt-8 print:pt-4 border-t border-gray-100">
        Mode: {isStudent ? 'Graduate Placement (Student)' : 'Talent Mobility (Professional)'} • Model: Random Forest (Simulated) • Version: 1.3.0
      </div>
    </div>
  );
};