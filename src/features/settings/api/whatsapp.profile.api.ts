import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

export interface WhatsappProfileData {
    name: string | null;
    about: string | null;
    phoneNumber: string | null;
    profilePicUrl: string | null;
}

export interface WhatsappProfileResponse {
    status: string;
    data: WhatsappProfileData;
}

export const whatsappProfile = async (): Promise<WhatsappProfileResponse> => {
    const response = await api.get(apiConst.Whatsapp.profile);
    return response.data;
};

export const updateWhatsappProfileName = async (name: string) => {
    const response = await api.post(apiConst.Whatsapp.profileName, { name });
    return response.data;
};

export const updateWhatsappProfileAbout = async (about: string) => {
    const response = await api.post(apiConst.Whatsapp.profileAbout, { about });
    return response.data;
};

export const updateWhatsappProfilePicture = async (image: string) => {
    const response = await api.post(apiConst.Whatsapp.profilePicture, {
        image,
    });
    return response.data;
};
