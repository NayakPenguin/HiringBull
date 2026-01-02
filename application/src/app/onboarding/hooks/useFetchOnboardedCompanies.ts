import { fetchOnboardedCompanies } from "@/app/onboarding/api"
import { useQuery } from "@tanstack/react-query"

const useFetchOnboardedCompanies = () => {
  return useQuery({
    queryKey:[],
    queryFn: fetchOnboardedCompanies,
  })
}
export default useFetchOnboardedCompanies