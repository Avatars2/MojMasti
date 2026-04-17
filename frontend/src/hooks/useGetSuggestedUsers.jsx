import { setSuggestedUsers } from "../redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { API_ENDPOINTS } from "../config/api";
import { logger } from "../utils/logger";

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                logger.log('Fetching suggested users...');
                const res = await axios.get(API_ENDPOINTS.USER.SUGGESTED, { 
                    withCredentials: true 
                });
                
                if (res.data.success) {
                    logger.log('Suggested users fetched:', res.data.users.length);
                    dispatch(setSuggestedUsers(res.data.users));
                }
            } catch (error) {
                logger.error('Failed to fetch suggested users', error);
            }
        }
        
        fetchSuggestedUsers();
    }, [dispatch]);
};

export default useGetSuggestedUsers;