"use client";

import React from "react";
import {
  DevtoolsPanel,
  DevtoolsProvider as DevtoolsProviderBase,
} from "@refinedev/devtools";

export const DevtoolsProvider = (props: React.PropsWithChildren) => {
  return (
    <DevtoolsProviderBase url="http://localhost:5001">
      {props.children}
      <DevtoolsPanel />
    </DevtoolsProviderBase>
  );
};