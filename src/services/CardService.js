import axios from "axios";

const API_BASE_URL = "http://localhost:8080/cards";

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
});

export const CardService = {
    getAllCards: async () => {
        const res = await axios.get(API_BASE_URL, {
            headers: getAuthHeaders()
        });
        return res.data.result;
    },

    deleteCard: async (cardId) => {
        await axios.delete(`${API_BASE_URL}/${cardId}`, {
            headers: getAuthHeaders()
        });
    },

    addCard: async (cardData) => {
        const res = await axios.post(API_BASE_URL, cardData, { headers: getAuthHeaders() });
        return res.data.result;
    },

    updateCard: async (cardId, updatedData) => {
        const res = await axios.put(`${API_BASE_URL}/${cardId}`, updatedData, { headers: getAuthHeaders() });
        return res.data.result;
    }
};
