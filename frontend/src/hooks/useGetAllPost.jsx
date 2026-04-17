import { setPosts } from "../redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { API_ENDPOINTS } from "../config/api";
import { logger } from "../utils/logger";

const useGetAllPost = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                logger.log('Fetching all posts...');
                const res = await axios.get(API_ENDPOINTS.POST.ALL, { 
                    withCredentials: true 
                });
                
                if (res.data.success) {
                    logger.log('Posts fetched:', res.data.posts.length);
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                logger.error('Failed to fetch posts', error);
            }
        }
        
        fetchAllPost();
    }, [dispatch]);
};

export default useGetAllPost;