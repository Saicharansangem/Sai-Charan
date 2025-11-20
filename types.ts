export interface LearningResource {
  title: string;
  type: 'course' | 'article' | 'book' | 'video';
  url: string;
}

export interface CareerRecommendation {
  id: string;
  title: string;
  matchScore: number; // 0-100
  description: string;
  missingSkills: string[];
  sharedSkills: string[];
  salaryRange: { min: number; max: number };
  reasoning: string[];
  learningResources: LearningResource[];
}

export type UserType = 'student' | 'professional';

export enum EducationLevel {
  HIGH_SCHOOL = "High School",
  ASSOCIATE = "Associate Degree",
  BACHELOR = "Bachelor's Degree",
  MASTER = "Master's Degree",
  PHD = "Ph.D.",
  OTHER = "Other"
}

export interface UserProfile {
  userType: UserType;
  fullName: string;
  currentTitle: string;
  yearsExperience: number;
  educationLevel: EducationLevel;
  major: string;
  skills: string[];
  interests: string[];
  desiredIndustry: string;
}

export interface JobMatchResult {
  jobId: string;
  matchScore: number;
  sharedSkills: string[];
  missingSkills: string[];
  analysis: string;
}