
import { AuthLogo } from "./AuthLogo";

export const AuthHeader = () => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <AuthLogo centered={true} />
    </div>
  );
};
