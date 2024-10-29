import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { IceCreamProvider } from './state/IceCreamProvider';
import IceCreamList from './pages/IceCreamList';
import IceCreamEdit from './pages/IceCreamEdit';
import { AuthProvider } from './auth/AuthProvider';
import { Login } from './pages/Login';
import { PrivateRoute } from './auth/PrivateRoute';
import { ToastProvider } from './state/toastProvider';
import { ellipse, square, triangle } from 'ionicons/icons';
import IceCreamSearch from './pages/IceCreamSearch';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AuthProvider>
        <ToastProvider>
          <IceCreamProvider>
            <MainRouter />
          </IceCreamProvider>
        </ToastProvider>
      </AuthProvider>
    </IonReactRouter>
  </IonApp>
);

const MainRouter: React.FC = () => {
  const location = useLocation();
  const showTabs = location.pathname === '/icecreams' || location.pathname === '/search'; // Only show tabs on these paths

  return (
    <IonTabs>
      <IonRouterOutlet>
        <PrivateRoute path="/icecreams" component={IceCreamList} exact={true} />
        <PrivateRoute path="/search" component={IceCreamSearch} exact={true} />
        <PrivateRoute path="/icecream" component={IceCreamEdit} exact={true} />
        <PrivateRoute path="/icecream/:id" component={IceCreamEdit} exact={true} />
        <Route path="/login" component={Login} exact={true} />
        <Route exact path="/" render={() => <Redirect to="/icecreams" />} />
      </IonRouterOutlet>
      {showTabs && (
        <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/icecreams">
            <IonIcon icon={triangle} />
            <IonLabel>List view</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/search">
            <IonIcon icon={ellipse} />
            <IonLabel>Search/filter</IonLabel>
          </IonTabButton>
        </IonTabBar>
      )}
    </IonTabs>
  );
};


export default App;
