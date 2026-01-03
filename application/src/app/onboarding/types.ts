export type OnboardedCompanies = {
    "id": string,
    "name": string,
    "logo": string,
    "description": null,
    "category": string,
    "createdAt": string
}[]


export type ProfileData = {
  name: string;
  isExperienced: boolean;
  collegeOrCompany: string;
  cgpaOrYoe: string;
  resumeLink: string;
};