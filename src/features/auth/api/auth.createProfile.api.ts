import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

interface CreateProfileApiPayload {
    fullName: string;
    gender: "male" | "female" | "other";
    age: number;
}

export const createProfileApi = async (
    data: CreateProfileApiPayload
) => {
    const response = await api.post(
        apiConst.AUTH.create_profile,
        data
    );

    return response.data;
};