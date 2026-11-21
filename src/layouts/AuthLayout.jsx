import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SYSTEM_DOCUMENT_TITLE } from "@/lib/constants/documentTitle";

export default function AuthLayout() {
  const location = useLocation();
  const { i18n } = useTranslation();

  const isAR = i18n.language?.startsWith("ar");


  useEffect(() => {
    document.title = SYSTEM_DOCUMENT_TITLE;
  }, [location.pathname]);


  return (
    <div
      className={`
        min-h-screen
        flex
        items-center
        justify-center
        bg-muted/50
        px-4
        ${isAR ? "direction-rtl" : ""}
      `}
    >

      <div className="w-full max-w-6xl">
        <Outlet />
      </div>

    </div>
  );
}