// checking to see if window variable is defined to see if it's running from server
export const isServer = () => typeof window === "undefined";

// if undefined it means we are on the server!
