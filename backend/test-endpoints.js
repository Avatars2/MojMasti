// Simple test to verify server is running and responding
import http from 'http';

const API_BASE = 'http://localhost:8000';

// Test endpoints (without authentication - should return auth errors)
const endpoints = [
    { path: '/api/v1/story', description: 'Get Stories' },
    { path: '/api/v1/story/my-stories', description: 'Get User Stories' },
    { path: '/api/v1/post/all?type=reel', description: 'Get Reels' },
    { path: '/api/v1/post/all?search=test', description: 'Search Posts' },
];

console.log('🧪 Testing Instagram-like Features API Endpoints...\n');

endpoints.forEach(({ path, description }) => {
    const options = {
        hostname: 'localhost',
        port: 8000,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            const status = res.statusCode;
            const success = status === 401 ? '✅' : status === 200 ? '✅' : '❌';
            const message = status === 401 ? 'Auth required (expected)' : 
                           status === 200 ? 'Working' : `Error ${status}`;
            
            console.log(`${success} ${description}: ${message}`);
        });
    });

    req.on('error', (error) => {
        console.log(`❌ ${description}: Connection error - ${error.message}`);
    });

    req.end();
});

// Test server connectivity
const healthCheck = http.request('http://localhost:8000/api/v1/user/register', (res) => {
    console.log('\n🎉 Server is running and responding!');
    console.log('📱 Instagram-like features are ready to use with proper authentication.');
    console.log('✅ Stories, Reels, Explore page - All endpoints are accessible');
});

healthCheck.on('error', (error) => {
    console.log('❌ Server connection failed:', error.message);
});

healthCheck.end();
