import { RouteComponentProps } from "react-router";
import { getLogger } from "../core";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth/AuthProvider";
import { IonButton, IonContent, IonHeader, IonInfiniteScroll, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from "@ionic/react";

const log = getLogger('Login');

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const { username, password } = state;

    const handlePasswordChange = useCallback((e: any) => setState({
        ...state,
        password: e.detail.value || ''
    }), [state]);
    const handleUsernameChange = useCallback((e: any) => setState({
        ...state,
        username: e.detail.value || ''
    }), [state]);
    const handleLogin = useCallback(() => {
        log('handleLogin...');
        login?.(username, password);
    }, [username, password]);
    log('render');
    useEffect(() => {
        if (isAuthenticated) {
            log('redirecting to home');
            history.push('/');
        }
    }, [isAuthenticated]);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    placeholder="Username"
                    value={username}
                    onIonChange={handleUsernameChange}
                />
                <IonInput
                    placeholder="Password"
                    value={password}
                    type="password"
                    onIonChange={handlePasswordChange}
                />
                <IonLoading isOpen={isAuthenticating} />
                {authenticationError && (
                    <div>{authenticationError.message || 'Failed to authenticate'}</div>
                )}
                <IonButton onClick={handleLogin}>Login</IonButton>
            </IonContent>
        </IonPage>
    );
}