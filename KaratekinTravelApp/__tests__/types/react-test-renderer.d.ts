declare module 'react-test-renderer' {
  import * as React from 'react';
  const TestRenderer: any;
  export function act(cb: () => void | Promise<void>): Promise<void> | void;
  export default TestRenderer;
}
