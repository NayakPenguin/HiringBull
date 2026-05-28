import { client } from "@/api"
import { OnboardedCompanies } from "@/app/onboarding/types";
import Domains from "@/service/domains"

export const fetchOnboardedCompanies = async ()=>{
  const {data} = await client.get<OnboardedCompanies>(Domains.onboardedCompanies);
  return data;
}