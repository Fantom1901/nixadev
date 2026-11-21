// src/app/admin/layout.tsx
"use client";

import React from "react";
import { ThemedLayout, ThemedHeader, ThemedSider, ThemedTitle } from "@refinedev/antd";
import {AdminHeader} from "@components/header/admin-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader/>
      <ThemedLayout
      Title={(titleProps) => (
        <ThemedTitle
          {...titleProps}
          text="NixaDev Admin"

        />
      )}
      Header={() => <ThemedHeader sticky />}
      Sider={(props) => (
        <ThemedSider
          {...props}
          fixed
          render={({ items }) => items}
        />
      )}
    >
      {children}
    </ThemedLayout>
    </>

  );
}