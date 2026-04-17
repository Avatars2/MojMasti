import { useEffect } from 'react'
import ChatPage from './components/ChatPage'
import EditProfile from './components/EditProfile'
import MobileApp from './components/MobileApp'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Signup from './components/Signup'
import MobileExplore from './components/MobileExplore'
import MobileReels from './components/MobileReels'
import Likes from './components/Likes'
import Saved from './components/Saved'
import Posts from './components/Posts'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import ProtectedRoutes from './components/ProtectedRoutes'
import ErrorPage from './components/ErrorPage';

// Redirect component for root path
const RootRedirect = () => {
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  }, [user, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
};


const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
    errorElement: <ErrorPage />
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: "/signup", 
    element: <Signup />,
    errorElement: <ErrorPage />
  },
  {
    path: "/app",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <ProtectedRoutes><MobileApp /></ProtectedRoutes>,
        children: [
          {
            index: true,
            element: <ProtectedRoutes><Posts /></ProtectedRoutes>
          }
        ]
      },
      {
        path: '/app/profile/:id',
        element: <ProtectedRoutes> <Profile /></ProtectedRoutes>
      },
      {
        path: '/app/account/edit',
        element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>
      },
      {
        path: '/app/chat',
        element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>
      },
      {
        path: '/app/explore',
        element: <ProtectedRoutes><MobileExplore /></ProtectedRoutes>
      },
      {
        path: '/app/reels',
        element: <ProtectedRoutes><MobileReels /></ProtectedRoutes>
      },
      {
        path: '/app/likes',
        element: <ProtectedRoutes><Likes /></ProtectedRoutes>
      },
      {
        path: '/app/saved',
        element: <ProtectedRoutes><Saved /></ProtectedRoutes>
      },
    ]
  },
])

function App() {
  const { user } = useSelector(store => store.auth);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io('http://localhost:5000', {
        query: {
          userId: user?._id
        },
        transports: ['websocket']
      });
      dispatch(setSocket(socketio));

      // listen all the events
      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App  