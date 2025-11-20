import React, { useState } from 'react';
import { UserProfile, EducationLevel, UserType } from '../types';
import { Button } from '../components/Button';
import { Plus, X, Zap, GraduationCap, Briefcase } from 'lucide-react';

interface ProfileInputProps {
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const demoProfiles: Record<string, UserProfile> = {
  student: {
    userType: 'student',
    fullName: "Alex Chen",
    currentTitle: "CS Senior Student",
    yearsExperience: 0,
    educationLevel: EducationLevel.BACHELOR,
    major: "Computer Science",
    skills: ["Python", "Java", "Data Structures", "Algorithms", "Basic SQL"],
    interests: ["AI Research", "Game Development"],
    desiredIndustry: "Tech"
  },
  professional: {
    userType: 'professional',
    fullName: "Sarah Miller",
    currentTitle: "Marketing Analyst",
    yearsExperience: 4,
    educationLevel: EducationLevel.MASTER,
    major: "Statistics",
    skills: ["Excel", "SQL", "Tableau", "Google Analytics", "Communication"],
    interests: ["Data Science", "Machine Learning", "Python"],
    desiredIndustry: "FinTech"
  }
};

export const ProfileInput: React.FC<ProfileInputProps> = ({ initialProfile, onSave }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !profile.interests.includes(interestInput.trim())) {
      setProfile(prev => ({ ...prev, interests: [...prev.interests, interestInput.trim()] }));
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setProfile(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
  };

  const loadDemo = (key: string) => {
    setProfile(demoProfiles[key]);
  };

  const toggleUserType = (type: UserType) => {
    setProfile(prev => ({ ...prev, userType: type }));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Professional Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Tell us about yourself to get tailored recommendations.</p>
        </div>
        <div className="flex gap-2">
             <span className="text-xs font-medium text-gray-400 self-center mr-1 uppercase tracking-wider hidden md:block">Demo:</span>
            <button onClick={() => loadDemo('student')} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100 border border-indigo-100">Student</button>
            <button onClick={() => loadDemo('professional')} className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded hover:bg-teal-100 border border-teal-100">Professional</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* User Type Toggle */}
        <div className="flex justify-center pb-6 border-b border-gray-100">
            <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                <button
                    type="button"
                    onClick={() => toggleUserType('student')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                        profile.userType === 'student' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <GraduationCap size={18} />
                    Student / Graduate
                </button>
                <button
                    type="button"
                    onClick={() => toggleUserType('professional')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                        profile.userType === 'professional' 
                        ? 'bg-white text-teal-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Briefcase size={18} />
                    Professional / Employee
                </button>
            </div>
        </div>

        {/* Basic Info Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              {profile.userType === 'student' ? 'Academic Profile' : 'Professional Summary'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={profile.fullName}
                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  {profile.userType === 'student' ? 'Current Status / Degree' : 'Current Job Title'}
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={profile.currentTitle}
                onChange={e => setProfile({ ...profile, currentTitle: e.target.value })}
                placeholder={profile.userType === 'student' ? "CS Senior Student" : "Senior Analyst"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={profile.yearsExperience}
                onChange={e => setProfile({ ...profile, yearsExperience: Number(e.target.value) })}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                 {profile.userType === 'student' ? 'Desired Industry' : 'Target Industry / Vertical'}
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={profile.desiredIndustry}
                onChange={e => setProfile({ ...profile, desiredIndustry: e.target.value })}
                placeholder="FinTech, HealthTech, etc."
              />
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={profile.educationLevel}
                onChange={e => setProfile({ ...profile, educationLevel: e.target.value as EducationLevel })}
              >
                {Object.values(EducationLevel).map((level: string) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Major / Field of Study</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={profile.major}
                onChange={e => setProfile({ ...profile, major: e.target.value })}
                placeholder="Computer Science"
              />
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Skills & Expertise</h3>
          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill (e.g., Python, Project Management)"
              />
              <Button type="button" onClick={handleAddSkill} variant="secondary" size="sm"><Plus size={18} /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.skills.map(skill => (
                <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-2 text-indigo-400 hover:text-indigo-600">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {profile.skills.length === 0 && <span className="text-sm text-gray-400 italic">No skills added yet.</span>}
            </div>
          </div>
        </section>

        {/* Interests Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Interests</h3>
          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={interestInput}
                onChange={e => setInterestInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                placeholder="Add an interest (e.g., AI, Sustainablity)"
              />
              <Button type="button" onClick={handleAddInterest} variant="secondary" size="sm"><Plus size={18} /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.interests.map(interest => (
                <span key={interest} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-100">
                  {interest}
                  <button type="button" onClick={() => handleRemoveInterest(interest)} className="ml-2 text-teal-400 hover:text-teal-600">
                    <X size={14} />
                  </button>
                </span>
              ))}
               {profile.interests.length === 0 && <span className="text-sm text-gray-400 italic">No interests added yet.</span>}
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <Button type="submit" size="lg">
            <Zap size={18} className="mr-2" />
            {profile.userType === 'student' ? 'Find Career Paths' : 'Analyze Career Gaps'}
          </Button>
        </div>
      </form>
    </div>
  );
};