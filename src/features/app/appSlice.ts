import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

interface AppState {
  loggedUser: string | null
  offline: boolean
}

const loggedUser = localStorage.getItem('user')

const initialState: AppState = {
  loggedUser,
  offline: false,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoggedUser(state, action) {
      state.loggedUser = action.payload
    },
    setOffline(state, action) {
      state.offline = action.payload
    },
  },
})

export const { setLoggedUser, setOffline } = appSlice.actions
export const selectLoggedUser = (state: RootState) => state.app.loggedUser
export const selectOffline = (state: RootState) => state.app.offline

export default appSlice.reducer

export const setLogInStatus =
  ({ newToken, username }: { newToken: string; username: string }) =>
  (dispatch: (arg0: { payload: undefined; type: string }) => void) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', username)
    dispatch(setLoggedUser(username))
  }

export const setLogOutStatus = () => (dispatch: (arg0: { payload: undefined; type: string }) => void) => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  dispatch(setLoggedUser(null))
}
