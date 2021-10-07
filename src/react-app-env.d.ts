/// <reference types="react-scripts" />
declare module '*.wav' {
    const src: string;
    export default src;
  }

  declare module "*.png" {
    const value: string;
    export = value;
 }