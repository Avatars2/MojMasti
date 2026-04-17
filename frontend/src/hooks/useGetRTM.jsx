import { addMessage } from "../redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logger } from "../utils/logger";

const useGetRTM = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector(store => store.socketio);

    useEffect(() => {
        if (!socket) return;

        const handler = (newMessage) => {
            logger.log('RTM newMessage received', newMessage);
            dispatch(addMessage(newMessage));
        };

        socket.on('newMessage', handler);
        return () => socket.off('newMessage', handler);
    }, [socket, dispatch]);
};
export default useGetRTM;