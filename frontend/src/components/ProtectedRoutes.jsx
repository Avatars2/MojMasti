import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoutes = ({ children }) => {
    const { user, loading } = useSelector(store => store.auth);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [user, loading, navigate]);
    
    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }
    
    // If not authenticated, don't render children (will redirect)
    if (!user) {
        return null;
    }
    
    return <>{children}</>
}

export default ProtectedRoutes;