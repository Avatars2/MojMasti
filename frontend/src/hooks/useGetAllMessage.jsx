import { setMessages, clearMessages } from "../redux/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API_ENDPOINTS } from "../config/api";
import { logger } from "../utils/logger";
import { toast } from "sonner";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const { selectedUser, user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchAllMessage = async () => {
            if (!selectedUser || !user) {
                dispatch(clearMessages());
                return;
            }

            // Quick client-side mutual follow check for UX
            const isMutual = (user.following || []).map(String).includes(String(selectedUser._id)) &&
                             (selectedUser.following || []).map(String).includes(String(user._id));

            if (!isMutual) {
                dispatch(clearMessages());
                return;
            }

            try {
                logger.log('Fetching messages...');
                const res = await axios.get(`${API_ENDPOINTS.MESSAGE.GET_ALL(selectedUser._id)}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                logger.error('Failed to fetch messages', error);
                toast.error(error.response?.data?.message || 'Failed to load messages');
                dispatch(clearMessages());
            }
        }
        fetchAllMessage();
    }, [selectedUser, user, dispatch]);
};
export default useGetAllMessage;