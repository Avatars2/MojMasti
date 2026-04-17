import { setUserProfile } from "../redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { API_ENDPOINTS } from "../config/api";
import { logger } from "../utils/logger";

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(API_ENDPOINTS.USER.PROFILE(userId), { 
                    withCredentials: true 
                });
                if (res.data.success) {
                    dispatch(setUserProfile(res.data.user));
                    logger.log('User profile fetched');
                }
            } catch (error) {
                logger.error('Failed to fetch user profile', error);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [userId, dispatch]);
};

export default useGetUserProfile;
































/*
import { setUserProfile } from "../redux/authSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";


const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    // const [userProfile, setUserProfile] = useState(null);
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/user/${userId}/profile`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchUserProfile();
    }, [userId]);
};
export default useGetUserProfile;
*/