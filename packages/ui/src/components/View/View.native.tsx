import React from 'react';
import { View as RNView, ViewProps as RNViewProps } from 'react-native';

export interface ViewProps extends RNViewProps {
  children: React.ReactNode;
  className?: string | undefined;
}

export function View({ children, className, ...props }: ViewProps) {
  // Note: className is ignored in React Native - use style prop instead
  // This is here for API compatibility with the web version
  return (
    <RNView {...props}>
      {children}
    </RNView>
  );
}