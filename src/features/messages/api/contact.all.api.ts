import apiConst from "@/consts/api/apiConst";
import api from "@/utils/api/api";

export const contactApp = async () => {
    const response = await api.get(apiConst.Contact.allcontact);
    console.log(response)
    return response.data;
};