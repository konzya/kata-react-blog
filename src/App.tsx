import React, { useEffect } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { Alert } from 'antd'
import AppHeader from './components/AppHeader/AppHeader'
import ArticlesPage from './components/ArticlesPage/ArticlesPage'
import ArticlePage from './components/ArticlePage/ArticlePage'
import SignInPage from './components/SignInPage/SignInPage'
import SignUpPage from './components/SignUpPage/SignUpPage'
import ProfilePage from './components/ProfilePage/ProfilePage'
import CreateArticlePage from './components/CreateArticlePage/CreateArticlePage'
import EditArticlePage from './components/EditArticlePage/EditArticlePage'

import styles from './App.module.scss'
import { selectLoggedUser, selectOffline, setOffline } from './features/app/appSlice'
import { useAppSelector, useAppDispatch } from './app/hooks'

function App() {
  const dispatch = useAppDispatch()
  const loggedUser = useAppSelector(selectLoggedUser)
  const offline = useAppSelector(selectOffline)

  useEffect(() => {
    window.addEventListener('offline', () => dispatch(setOffline(true)))
    window.addEventListener('online', () => dispatch(setOffline(false)))
  }, [dispatch])
  return (
    <div className={styles.app}>
      <AppHeader />
      {offline && <Alert message="No internet" type="error" showIcon style={{ width: 200, margin: 'auto' }} />}
      <Switch>
        <Route path={['/', '/articles']} exact>
          <Redirect to="/articles/page/1" />
        </Route>
        <Route path="/articles/page/:page" component={ArticlesPage} exact />
        <Route path="/articles/:slug" component={ArticlePage} exact />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
        <Route path="/profile">{loggedUser ? <ProfilePage /> : <Redirect to="/sign-in" />}</Route>
        <Route path="/new-article">{loggedUser ? <CreateArticlePage /> : <Redirect to="/sign-in" />}</Route>
        <Route path="/articles/:slug/edit" exact>
          {loggedUser ? <EditArticlePage /> : <Redirect to="/sign-in" />}
        </Route>
        <Route
          render={() => (
            <h2 style={{ margin: '40px auto 40px auto', fontSize: '30vh', display: 'block', textAlign: 'center' }}>
              404
            </h2>
          )}
        />
      </Switch>
    </div>
  )
}

export default App
