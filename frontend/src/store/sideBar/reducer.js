import { SIDEBAR } from "./actionTypes";

const initState = {
  sidebarShow : true
};
export default function reducer(state = initState, { type, payload}) {
  switch (type) {
    case SIDEBAR:
      return { ...state, sidebarShow : payload };
    default:
      return state;
  }
}
