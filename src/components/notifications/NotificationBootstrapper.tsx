import { useStartupNotificationChecks } from '../../hooks/useStartupNotificationChecks';

type NotificationBootstrapperProps = {
  userKey?: string;
};

const NotificationBootstrapper = ({ userKey }: NotificationBootstrapperProps) => {
  useStartupNotificationChecks(userKey);

  return null;
};

export default NotificationBootstrapper;
