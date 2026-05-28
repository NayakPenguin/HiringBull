import { useMutation } from "@tanstack/react-query"
import { registerUser } from "../api"

const useRegisterOrEditUser = () => {
  return useMutation({
    mutationFn: registerUser,
  })
}
export default useRegisterOrEditUser