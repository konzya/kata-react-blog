import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Avatar, Button, Spin } from 'antd'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useGetCurrentUserQuery } from '../../features/api/apiSlice'
import { selectLoggedUser, setLogOutStatus } from '../../features/app/appSlice'
import 'antd/dist/antd.min.css'
import style from './AppHeader.module.scss'

export default function AppHeader() {
  const history = useHistory()
  const loggedUser = useAppSelector(selectLoggedUser)
  const dispatch = useAppDispatch()
  const { data, isFetching } = useGetCurrentUserQuery()

  const noauth = (
    <>
      <Button className={style['app-header__button']} type="text" onClick={() => history.push('/sign-in')}>
        Sign In
      </Button>

      <Button
        className={`${style['app-header__button']} ${style['app-header__button--success']}`}
        onClick={() => history.push('/sign-up')}
      >
        Sign Up
      </Button>
    </>
  )

  const auth = (
    <>
      <Button
        className={`${style['app-header__button']} ${style['app-header__button--success']} ${style['app-header__button--small']}`}
        onClick={() => history.push('/new-article')}
      >
        Create article
      </Button>

      <Link className={style['app-header__profile']} to="/profile">
        {isFetching ? (
          <Spin className={style['app-header__spin']} />
        ) : (
          <span className={`${style['app-header__username']}`}>{data?.user.username}</span>
        )}

        <Avatar
          className={`${style['app-header__avatar']}`}
          src={data?.user.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'}
        />
      </Link>

      <Button
        className={`${style['app-header__button']} ${style['app-header__button--out']}`}
        onClick={() => dispatch(setLogOutStatus())}
      >
        Log Out
      </Button>
    </>
  )
  return (
    <header className={style['app-header']}>
      <main className={style['app-header__body']}>
        <Link className={style['app-header__logo']} to="/">
          <span>Realworld Blog</span>
        </Link>

        <div className={style['app-header__right-container']}>{loggedUser ? auth : noauth}</div>
      </main>
    </header>
  )
}
