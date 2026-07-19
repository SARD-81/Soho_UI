import { useDiskTemperatureNotifications } from '../../hooks/useDiskTemperatureNotifications';
import { useResourceStatusChangeNotifications } from '../../hooks/useResourceStatusChangeNotifications';
import { useStartupNotificationChecks } from '../../hooks/useStartupNotificationChecks';

type NotificationBootstrapperProps = {
  userKey?: string;
};

const NotificationBootstrapper = ({ userKey }: NotificationBootstrapperProps) => {
  useStartupNotificationChecks(userKey);
  useResourceStatusChangeNotifications(userKey);
  useDiskTemperatureNotifications(userKey);

  return null;
};

export default NotificationBootstrapper;
