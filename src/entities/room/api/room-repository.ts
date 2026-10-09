import { axiosClient } from "@/shared/api/axios-client";

export const roomRepository = {
  list: () => axiosClient.get<unknown>("/rooms").then((response) => response.data),
};
