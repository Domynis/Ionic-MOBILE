import React, { useCallback, useEffect, useState } from "react";
import { getLogger } from "../core";
import { login as loginApi } from "./authApi"
import PropTypes from "prop-types";

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;

export interface AuthState {
    token: string;
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFn;
    logout?: () => void;
    pendingAuthentication?: boolean;
    username?: string;
    password?: string;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authenticationError: null,
    pendingAuthentication: false,
    token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setState] = useState<AuthState>(() => {
        const token = localStorage.getItem('token') || '';
        return {
            ...initialState,
            token,
            isAuthenticated: !!token,
        }
    });
    const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
    const login = useCallback<LoginFn>(loginCallBack, []);
    const logout = useCallback(logoutCallBack, []);
    useEffect(authenticationEffect, [pendingAuthentication])
    const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token };

    log('render')
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

    function loginCallBack(username?: string, password?: string): void {
        log('login');
        setState({
            ...state,
            pendingAuthentication: true,
            username,
            password
        });
    }

    function logoutCallBack(): void {
        log('logout');
        localStorage.removeItem('token');
        setState({
            ...state,
            isAuthenticated: false,
            isAuthenticating: false,
            authenticationError: null,
            pendingAuthentication: false,
            token: '',
        });
    }

    function authenticationEffect() {
        let canceled = false;
        authenticate();
    
        return () => {
            canceled = true;
        };
    
        async function authenticate() {
            if (!state.pendingAuthentication) {
                log('authenticate, !pendingAuthentication, return');
                return;
            }
            try {
                if (canceled) {
                    return;
                }
                log('authenticate...');
                setState(prevState => ({
                    ...prevState,
                    isAuthenticating: true,
                }));
    
                const { username, password } = state;
                const { token } = await loginApi(username, password);
    
                log('authenticate succeeded');
                localStorage.setItem('token', token);
                setState(prevState => ({
                    ...prevState,
                    token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                }));
            } catch (error) {
                if (canceled) {
                    return;
                }
                log('authenticate failed');
                setState(prevState => ({
                    ...prevState,
                    authenticationError: error as Error,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                }));
            }
        }
    }
    
}