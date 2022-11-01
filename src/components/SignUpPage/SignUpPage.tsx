import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button, Checkbox, Form, Input, Alert, message } from 'antd'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectLoggedUser, setLogInStatus } from '../../features/app/appSlice'
import styles from './SignUpPage.module.scss'
import SmallFormWrapper from '../SmallFormWrap/SmallFormWrap'
import { useSignUpMutation } from '../../features/api/apiSlice'
import makeErrorMessage from '../../helpers'

interface IForm {
  username: string
  email: string
  password: string
  passwordRepeat: string
}

export default function SignUpPage() {
  const [signUp, { error, originalArgs, data, isLoading }] = useSignUpMutation()
  const [form] = Form.useForm<IForm>()
  const dispatch = useAppDispatch()
  const [needErrorMessage, setNeedErrorMessage] = useState(false)
  const loggedUser = useAppSelector(selectLoggedUser)
  const history = useHistory()

  const onFinish = ({ username, email, password }: IForm) => {
    signUp({
      user: {
        username,
        email,
        password,
      },
    })
  }

  useEffect(() => {
    if (error) {
      form.validateFields()
      const err = error as any
      if (!err?.data?.errors?.username && !err?.data?.errors?.email && !err?.data?.errors?.password)
        setNeedErrorMessage(true)
    }
    return () => setNeedErrorMessage(false)
  }, [error, form, needErrorMessage])

  useEffect(() => {
    if (data?.user.token && data?.user.username) {
      dispatch(setLogInStatus({ newToken: data.user.token, username: data.user.username }))
      message.success('success')
    }
  }, [data, dispatch, history])

  useEffect(() => {
    if (loggedUser) history.goBack()
  }, [history, loggedUser])

  if (loggedUser) {
    return <Alert message="You already logged" type="warning" style={{ width: '50%', margin: 'auto' }} />
  }

  return (
    <SmallFormWrapper header="Sign Up">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        requiredMark={false}
        scrollToFirstError
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            { min: 3 },
            { max: 20 },
            { required: true },
            () => ({
              validator(_, value) {
                const err = error as any
                if (err?.data?.errors?.username && value === originalArgs?.user.username)
                  return Promise.reject(new Error(err.data.errors.username))
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input placeholder="Username" />
        </Form.Item>

        <Form.Item
          label="Email address"
          name="email"
          rules={[
            { required: true },
            { type: 'email' },
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
            { min: 6 },
            { max: 40 },
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

        <Form.Item
          label="Repeat Password"
          name="passwordRepeat"
          dependencies={['password']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'))
              },
            }),
          ]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement')),
            },
          ]}
        >
          <Checkbox className={styles.checkbox}>I agree to the processing of my personal information</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isLoading}>
            Submit
          </Button>
          <span className={styles.span}>
            Already have an account? <Link to="sign-in"> Sign In</Link>
          </span>
        </Form.Item>
      </Form>
      {error && needErrorMessage && (
        <Alert message="Error" description={makeErrorMessage(error)} type="error" showIcon />
      )}
    </SmallFormWrapper>
  )
}
