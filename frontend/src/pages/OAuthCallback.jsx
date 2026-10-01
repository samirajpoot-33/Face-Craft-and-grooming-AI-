import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { githubLogin, discordLogin, googleLogin, instagramLogin } from '../utils/api';

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const pathname = window.location.pathname;
    const [processing, setProcessing] = useState(false);
    
    // Determine provider from pathname
    let provider = 'unknown';
    if (pathname.includes('github')) provider = 'github';
    else if (pathname.includes('discord')) provider = 'discord';
    else if (pathname.includes('google')) provider = 'google';
    else if (pathname.includes('instagram')) provider = 'instagram';
    
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    useEffect(() => {
        // Prevent multiple executions
        if (processing) return;
        
        const handleCallback = async () => {
            setProcessing(true);
            
            if (error) {
                // Map error codes to user-friendly messages
                const errorMessages = {
                    'github_auth_failed': 'GitHub authentication failed. Please try again.',
                    'github_not_configured': 'GitHub OAuth is not configured on the server.',
                    'github_token_failed': 'Failed to get GitHub access token. Please try again.',
                    'github_code_expired': 'GitHub authorization code expired. Please try again.',
                    'discord_auth_failed': 'Discord authentication failed. Please try again.',
                    'discord_not_configured': 'Discord OAuth is not configured on the server.',
                    'discord_token_failed': 'Failed to get Discord access token. Please try again.',
                    'discord_code_expired': 'Discord authorization code expired. Please try again.',
                    'google_auth_failed': 'Google authentication failed. Please try again.',
                    'google_not_configured': 'Google OAuth is not configured on the server.',
                    'google_token_failed': 'Failed to get Google access token. Please try again.',
                    'google_code_expired': 'Google authorization code expired. Please try again.',
                    'linkedin_auth_failed': 'LinkedIn authentication failed. Please try again.',
                    'linkedin_not_configured': 'LinkedIn OAuth is not configured on the server.',
                    'linkedin_token_failed': 'Failed to get LinkedIn access token. Please try again.',
                    'linkedin_code_expired': 'LinkedIn authorization code expired. Please try again.',
                    'oauth_failed': 'OAuth authentication failed. Please try again.',
                    'invalid_provider': 'Invalid OAuth provider.'
                };
                const errorMsg = errorMessages[error] || `Authentication error: ${error}`;
                navigate(`/login?error=${encodeURIComponent(errorMsg)}`);
                return;
            }

            if (!token) {
                navigate('/login?error=' + encodeURIComponent('No access token received. Please try again.'));
                return;
            }

            try {
                let result;
                if (provider === 'github') {
                    result = await githubLogin(token);
                } else if (provider === 'discord') {
                    result = await discordLogin(token);
                } else if (provider === 'google') {
                    result = await googleLogin(null, token); // Pass null for credential, token as accessToken
                } else if (provider === 'instagram') {
                    result = await instagramLogin(token);
                } else {
                    navigate('/login?error=' + encodeURIComponent('Invalid OAuth provider'));
                    return;
                }

                if (result && result.success) {
                    // Wait a moment for localStorage to be set and auth context to update
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Use window.location.href for a full page reload to ensure auth state is properly loaded
                    window.location.href = '/dashboard';
                } else {
                    const errorMsg = result?.message || 'OAuth login failed. Please try again.';
                    navigate(`/login?error=${encodeURIComponent(errorMsg)}`);
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                const errorMsg = err?.response?.data?.message || err?.message || 'OAuth authentication failed. Please try again.';
                navigate(`/login?error=${encodeURIComponent(errorMsg)}`);
            }
        };

        handleCallback();
    }, [token, provider, navigate, error, processing]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-200 text-lg font-semibold">Completing {provider} login...</p>
                <p className="text-slate-400 text-sm mt-2">Please wait a moment</p>
            </div>
        </div>
    );
}
