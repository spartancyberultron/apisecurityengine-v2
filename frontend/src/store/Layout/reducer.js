import { LOGIN_DATA } from "./actionTypes";

const initState = {
  loginInfo: {}
};
export default function reducer(state = initState, { type, payload}) {
  switch (type) {
    case LOGIN_DATA:
      return { ...state, loginInfo : payload };
    default:
      return state;
  }
}
