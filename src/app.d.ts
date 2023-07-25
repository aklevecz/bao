// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: any;
      sessionStart: string;
      authFlowState: "preauth" | "authing";
      prospectiveUsername: string;
      known: boolean;
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
