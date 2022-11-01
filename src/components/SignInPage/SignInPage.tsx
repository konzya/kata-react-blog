import React, { useEffect, useState } from 'react'
import { Alert, Button, Form, Input, message } from 'antd'
import { Link, useHistory } from 'react-router-dom'
import styles from './SignInPage.module.scss'
import SmallFormWrapper from '../SmallFormWrap/SmallFormWrap'
import { useSignInMutation } from '../../features/api/apiSlice'
import makeErrorMessage from '../../helpers'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectLoggedUser, setLogInStatus } from '../../features/app/appSlice'

interface IForm {
  email: string
  password: string
}

export default function SignInPage() {
  const [signIn, { error, data, isLoading, originalArgs }] = useSignInMutation()
  const dispatch = useAppDispatch()
  const loggedUser = useAppSelector(selectLoggedUser)
  const history = useHistory()
  const [form] = Form.useForm<IForm>()
  const [needErrorMessage, setNeedErrorMessage] = useState(false)

  const onFinish = ({ password, email }: IForm) => {
    const obj = {
      user: {
        email,
        password,
      },
    }
    signIn(obj)
  }

  useEffect(() => {
    if (data?.user?.token && data?.user?.username) {
      dispatch(setLogInStatus({ newToken: data.user.token, username: data.user.username }))
      message.success('success')
    }
  }, [data, dispatch, history])

  useEffect(() => {
    if (error) {
      form.validateFields()
      const err = error as any
      if (!err?.data?.errors?.username && !err?.data?.errors?.email) setNeedErrorMessage(true)
    }
    return () => setNeedErrorMessage(false)
  }, [error, form, needErrorMessage])

  if (loggedUser) {
    history.goBack()
    return <Alert message="You already logged" type="warning" style={{ width: '50%', margin: 'auto' }} />
  }

  return (
    <SmallFormWrapper header="Sign In">
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" requiredMark={false}>
        <Form.Item
          label="Email address"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'must be an email' },
            () => ({
              validator(_, value) {
                const err = error as any
                if (err?.data?.errors?.email && value === originalArgs?.user.email)
                  return Promise.reject(new Error(err.data.errors.email))
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input placeholder="Email address" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true },
            () => ({
              validator(_, value) {
                const err = error as any
                if (err?.data?.errors?.password && value === originalArgs?.user.password)
                  return Promise.reject(new Error(err.data.errors.password))
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isLoading}>
            Submit
          </Button>
          <span className={styles.span}>
            Dont&apos;t have an account? <Link to="sign-up"> Sign Up</Link>
          </span>
        </Form.Item>
      </Form>
      {error && needErrorMessage && (
        <Alert message="Error" description={makeErrorMessage(error)} type="error" showIcon />
      )}
    </SmallFormWrapper>
  )
}
