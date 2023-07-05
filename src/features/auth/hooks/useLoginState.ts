type LoginState = {
  loggedIn: false
} | {
  loggedIn: true,
  name: string
}

export default function useLoginState(): LoginState {
  return {
    loggedIn: false
  };
}