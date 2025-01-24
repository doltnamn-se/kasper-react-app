import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

const MainNavigation = () => {
  const { t } = useTranslation();

  const navItems = [
    { label: "home", path: "/" },
    { label: "about", path: "/about" },
    { label: "services", path: "/services" },
    { label: "contact", path: "/contact" },
  ];

  return (
    <nav>
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.label}>
            <NavLink to={item.path}>
              <span className="text-sm text-[#000000] dark:text-slate-200 font-medium">
                {t(item.label)}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MainNavigation;
