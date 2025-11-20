import React, { useState } from 'react';
import { getCareerRecommendations } from './services/geminiService';
import { CareerRecommendation } from './types';
import { Button } from './components/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  Sparkles, 
  Send, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const data = await getCareerRecommendations(input);
      setRecommendations(data);
      if (data.length > 0) setExpandedId(data[0].id);
    } catch (err) {
      setError("I encountered an issue analyzing your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (type: 'student' | 'pro') => {
    if (type === 'student') {
      setInput("I am a final year Computer Science student. I know Python, Java, and basic SQL. I'm interested in AI and Data Science but don't have much real work experience. What should I apply for?");
    } else {
      setInput("I've been a Marketing Manager for 5 years managing social media campaigns and content teams. I want to pivot into Product Management or Tech. I have strong communication skills and know a bit of HTML/CSS.");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Colors for the Pie Chart
  const COLORS = ['#10b981', '#f59e0b']; // Emerald (Matched) and Amber (Missing)

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero / Header Section */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              NextStep Assistant
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        
        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400">
          <div className="p-1">
            <div className="bg-indigo-50/50 p-6 rounded-xl">
                <label className="block text-sm font-bold text-indigo-900 mb-2">
                Tell me about yourself
                </label>
                <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your skills, experience, and career goals here..."
                className="w-full h-32 resize-none bg-white border border-indigo-100 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700 placeholder:text-gray-400 text-lg leading-relaxed"
                />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
                <div className="flex gap-2">
                    <button onClick={() => loadExample('student')} className="text-xs bg-white text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full hover:bg-indigo-50 font-medium transition-colors shadow-sm">
                        Student Example
                    </button>
                    <button onClick={() => loadExample('pro')} className="text-xs bg-white text-teal-700 border border-teal-200 px-3 py-1.5 rounded-full hover:bg-teal-50 font-medium transition-colors shadow-sm">
                        Professional Example
                    </button>
                </div>
                <Button 
                    onClick={handleAnalyze} 
                    disabled={!input.trim() || loading} 
                    isLoading={loading}
                    className="w-full sm:w-auto shadow-md shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700"
                >
                    <Send size={16} className="mr-2" />
                    Analyze Profile
                </Button>
                </div>
            </div>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Empty State / Welcome */}
        {!loading && recommendations.length === 0 && !error && (
          <div className="text-center py-12 opacity-60">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Enter your profile details above to generate AI-powered career paths.</p>
          </div>
        )}

        {/* Results Section */}
        {recommendations.length > 0 && (
          <section className="space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recommended Paths</h2>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    Analysis Results
                </span>
            </div>

            <div className="grid gap-6">
              {recommendations.map((rec) => {
                // Prepare data for the chart specific to this recommendation
                const chartData = [
                    { name: 'Matched Skills', value: rec.sharedSkills.length },
                    { name: 'Missing Skills', value: rec.missingSkills.length }
                ];
                // Handle edge case where both are 0
                if (chartData.every(d => d.value === 0)) {
                    chartData[0].value = 1; // Dummy data to show something
                }

                return (
                <div 
                  key={rec.id} 
                  className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden
                    ${expandedId === rec.id 
                      ? 'border-indigo-200 shadow-lg ring-1 ring-indigo-50' 
                      : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                    }`}
                >
                  {/* Card Header */}
                  <div 
                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    onClick={() => toggleExpand(rec.id)}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`p-3.5 rounded-xl shrink-0 ${rec.matchScore > 80 ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-100 text-teal-600'}`}>
                        {rec.title.toLowerCase().includes('student') || rec.title.toLowerCase().includes('intern') ? <GraduationCap size={24} /> : <Briefcase size={24} />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{rec.title}</h3>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          <span className={`font-bold px-2 py-0.5 rounded ${rec.matchScore > 80 ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
                            {rec.matchScore}% Match
                          </span>
                          <span>•</span>
                          <span>${rec.salaryRange.min.toLocaleString()} - ${rec.salaryRange.max.toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{rec.description}</p>
                      </div>
                    </div>
                    <div className="self-end md:self-center">
                         {expandedId === rec.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div className={`border-t border-gray-100 bg-gray-50/50 px-6 pb-8 pt-6 ${expandedId === rec.id ? 'block' : 'hidden'}`}>
                    
                    {/* Visualization Section */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-1 bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center justify-center">
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Skill Gap Visualization</h4>
                             <div className="w-full h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                             </div>
                             <div className="text-center mt-1">
                                <span className="text-xs text-gray-500 font-medium">{rec.missingSkills.length} Critical Gaps Found</span>
                             </div>
                        </div>
                        <div className="col-span-2 space-y-4">
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Career Fit Analysis</h4>
                             <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                                 {rec.description}
                             </p>
                             <div className="flex gap-2 flex-wrap">
                                {rec.reasoning.map((r, i) => (
                                    <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                                        {r}
                                    </span>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        
                        {/* Left Col: Skills */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-emerald-100">
                                    <h5 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <CheckCircle size={12} /> Your Existing Strengths
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {rec.sharedSkills.map(skill => (
                                            <span key={skill} className="text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-amber-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-bl">
                                        NEEDS ATTENTION
                                    </div>
                                    <h5 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <AlertCircle size={12} /> Missing / Gap Skills
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {rec.missingSkills.map(skill => (
                                            <span key={skill} className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Resources */}
                        <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recommended Learning Path</h4>
                             <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
                                {rec.learningResources.map((res, i) => (
                                    <a 
                                        key={i} 
                                        href={res.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="group p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                            <BookOpen size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-900 truncate pr-2">{res.title}</p>
                                                <ExternalLink size={12} className="text-gray-300 group-hover:text-indigo-400" />
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{res.type}</span>
                                                <p className="text-xs text-gray-500 truncate">{res.url}</p>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                             </div>
                        </div>

                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;