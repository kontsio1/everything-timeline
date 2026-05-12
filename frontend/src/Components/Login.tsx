import React, { useState, useEffect } from "react";
import { Menu, MenuItem, Divider, CircularProgress } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../api/authConfig";

export const Login = () => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  const { instance, accounts } = useMsal();
  const activeAccount = accounts[0] ?? instance.getActiveAccount();

  const displayName = activeAccount
    ? activeAccount.name && activeAccount.name !== "unknown"
      ? activeAccount.name
      : ((activeAccount.idTokenClaims as any)?.email ?? "User")
    : null;

  const handleOpenMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleRedirect = async () => {
    setLoading(true);
    instance
      .loginRedirect({
        ...loginRequest,
        prompt: "select_account",
      })
      .catch((error) => {
        console.error(
          "%c loginRedirect() threw an error:",
          "color: red; font-weight: bold;",
          error,
        );
        setLoading(false);
      });
    handleCloseMenu();
  };

  const handleLogout = () => {
    setLoading(true);
    instance.logoutRedirect().catch((error) => {
      console.error("logoutRedirect error:", error);
      setLoading(false);
    });
    handleCloseMenu();
  };

  useEffect(() => {
    if (accounts.length > 0 && !instance.getActiveAccount()) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [accounts, instance]);

  //   const tokenResponse = await instance.acquireTokenSilent(request);

  //   // Attach this to your fetch/axios call
  //   const response = await fetch("https://azurewebsites.net", {
  //     headers: {
  //       Authorization: `Bearer ${tokenResponse.accessToken}`,
  //     },
  //   });

  return (
    <div
      onMouseEnter={handleOpenMenu}
      onMouseLeave={handleCloseMenu}
      style={{ display: "inline-flex" }}
    >
      <AccountCircleIcon className="user-icon" sx={{ fontSize: 48 }} />
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            className: "user-menu-paper",
            onMouseLeave: handleCloseMenu,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        disableAutoFocus
        disableEnforceFocus
      >
        {activeAccount
          ? [
              <MenuItem
                key="name"
                disabled
                sx={{
                  opacity: "1 !important",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                }}
              >
                {displayName}
              </MenuItem>,
              <Divider
                key="divider"
                sx={{ borderColor: "rgba(255,255,255,0.15)" }}
              />,
              <MenuItem
                key="logout"
                onClick={handleLogout}
                disabled={loading}
                sx={{ fontFamily: "DM Sans, sans-serif", fontSize: 13 }}
              >
                {loading ? (
                  <CircularProgress size={16} sx={{ color: "white" }} />
                ) : (
                  "Log Out"
                )}
              </MenuItem>,
            ]
          : [
              <MenuItem
                key="login"
                onClick={handleRedirect}
                disabled={loading}
                sx={{ fontFamily: "DM Sans, sans-serif", fontSize: 13 }}
              >
                {loading ? (
                  <CircularProgress size={16} sx={{ color: "white" }} />
                ) : (
                  "Log In"
                )}
              </MenuItem>,
            ]}
      </Menu>
    </div>
  );
};
