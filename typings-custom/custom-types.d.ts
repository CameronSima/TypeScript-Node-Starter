
declare type ConnectedSockets = Record<string, SocketIO.Socket>

declare interface FlashAndRedirectOptions {
  type: string
  message: any
  redirectTo?: string
}

declare interface flashAndRedirect {
  (options: FlashAndRedirectOptions): void
}

// Add custom properties to User object
declare module Express {
    export interface Request {
      flashAndRedirect?: flashAndRedirect
      sessionStore?: any
    }
  }