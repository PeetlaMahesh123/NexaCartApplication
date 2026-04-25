// Razorpay global type declarations
declare global {
  interface Window {
    Razorpay: new (options: any) => {
      open: () => void;
      close: () => void;
      on: (event: string, handler: Function) => void;
      off: (event: string, handler: Function) => void;
    };
  }
}

export {};
