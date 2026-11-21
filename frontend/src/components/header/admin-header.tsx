"use client";

import React, { useContext } from "react";
import { useLogout, useGetIdentity } from "@refinedev/core";
import { ColorModeContext } from "@contexts/color-mode";
import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import {
  Layout as AntdLayout,
  Button,
  Space,
  Switch,
  theme,
  Typography,
  Avatar,
} from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  id?: number;
  name?: string;
  username?: string;
  avatar?: string;
};

export const AdminHeader: React.FC<RefineThemedLayoutHeaderProps> = ({
                                                                       sticky = true,
                                                                     }) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);
  const { mutate: logout, isPending } = useLogout();

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  const userName = user?.name || user?.username;

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space size="middle" align="center">
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          checked={mode === "dark"}
        />

        {(userName || user?.avatar) && (
          <Space size="small">
            {userName && <Text strong>{userName}</Text>}
            {user?.avatar ? (
              <Avatar src={user?.avatar} alt={userName} />
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
          </Space>
        )}

        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          loading={isPending}
          onClick={() => logout()}
        >
          Выйти
        </Button>
      </Space>
    </AntdLayout.Header>
  );
};