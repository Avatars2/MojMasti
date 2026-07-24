import { useEffect } from 'react'

import EditProfile from './components/EditProfile'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Signup from './components/Signup'
import MobileExplore from './components/MobileExplore'
import Likes from './components/Likes'
import Saved from './components/Saved'
import Posts from './components/Posts'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'

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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
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
        index: true,
        element: <Posts />
      },
      {
        path: 'profile/:id',
        element: <Profile />
      },
      {
        path: 'account/edit',
        element: <EditProfile />
      },

      {
        path: 'explore',
        element: <MobileExplore />
      },
      {
        path: 'likes',
        element: <Likes />
      },
      {
        path: 'saved',
        element: <Saved />
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