import { createProfileApi } from "@/features/auth/api/auth.createProfile.api";
import { useMutation } from "@tanstack/react-query";

export const useCreateProfile = () => {
  return useMutation({
    mutationFn: createProfileApi,
  });
};