"use client";

import React from "react";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { DevtoolsProvider } from "@providers/devtools";
import { dataProvider } from "@providers/data-provider";
import { authProvider } from "@providers/auth-provider";
import { ThemedLayoutContextProvider } from "@refinedev/antd";
import { ColorModeContextProvider } from "@contexts/color-mode";
import {
  FolderOutlined,
  TrophyOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

interface RefineProviderProps {
  children: React.ReactNode;
  defaultMode: "light" | "dark";
}

export const RefineProvider = ({
                                 children,
                                 defaultMode,
                               }: RefineProviderProps) => {
  return (
    <ColorModeContextProvider defaultMode={defaultMode}>
      <ThemedLayoutContextProvider>
        <DevtoolsProvider>
          <Refine
            dataProvider={{
              default: dataProvider,
            }}
            routerProvider={routerProvider}
            authProvider={authProvider}
            resources={[
              {
                name: "dashboard",
                list: "/admin",
                meta: {
                  label: "Дашборд",
                  icon: <DashboardOutlined />,
                },
              },
              {
                name: "admin/projects",
                list: "/admin/projects",
                create: "/admin/projects/create",
                edit: "/admin/projects/edit/:id",
                meta: {
                  label: "Проекты",
                  icon: <FolderOutlined />,
                },
              },
              {
                name: "admin/achievements",
                list: "/admin/achievements",
                create: "/admin/achievements/create",
                edit: "/admin/achievements/edit/:id",
                meta: {
                  label: "Достижения",
                  icon: <TrophyOutlined />,
                },
              },
            ]}
          >
            {children}
          </Refine>
        </DevtoolsProvider>
      </ThemedLayoutContextProvider>
    </ColorModeContextProvider>
  );
};