declare module '*.svg' {
  const url: string;
  export default url;
  export const ReactComponent: React.ReactType;
}

declare module '*.png' {
  const url: string;
  export default url;
}

declare module '*.jpg' {
  const url: string;
  export default url;
}
