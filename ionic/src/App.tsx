import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
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

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <AuthProvider>
          <Route path="/login" component={Login} exact={true} />
          <IceCreamProvider>
            <PrivateRoute path="/icecreams" component={IceCreamList} exact={true} />
            <PrivateRoute path="/icecream" component={IceCreamEdit} exact={true} />
            <PrivateRoute path="/icecream/:id" component={IceCreamEdit} exact={true} />
          </IceCreamProvider>
          <Route exact path="/" render={() => <Redirect to="/icecreams" />} />
        </AuthProvider>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
