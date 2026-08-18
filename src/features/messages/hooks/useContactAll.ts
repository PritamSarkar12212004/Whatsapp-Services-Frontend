import { useQuery } from "@tanstack/react-query";
import { contactApp } from "../api/contact.all.api";

export const useContactAll = () => {
    return useQuery({
        queryKey: ["contact-all"],
        queryFn: contactApp,

    });
};