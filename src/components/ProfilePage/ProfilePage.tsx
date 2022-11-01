import { Alert, Button, Form, Input, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useGetCurrentUserQuery, useUpdateCurrentUserMutation } from '../../features/api/apiSlice'
import SmallFormWrapper from '../SmallFormWrap/SmallFormWrap'
import makeErrorMessage from '../../helpers'
import { setLogInStatus } from '../../features/app/appSlice'
import { useAppDispatch } from '../../app/hooks'

interface IForm {
  email: string
  password: string
  username: string
  image: string
}

export default function ProfilePage() {
  const { data } = useGetCurrentUserQuery()
  const [updateUser, { error, originalArgs, isLoading: isUpdateLoading, data: updateData }] =
    useUpdateCurrentUserMutation()
  const [form] = Form.useForm<IForm>()
  const dispatch = useAppDispatch()
  const [needErrorMessage, setNeedErrorMessage] = useState(false)
  const history = useHistory()

  useEffect(() => {
    if (error) {
      const err = error as any
      if (
        !err?.data?.errors?.username &&
        !err?.data?.errors?.email &&
        !err?.data?.errors?.password &&
        !err?.data?.errors?.image
      )
        setNeedErrorMessage(true)
      form.validateFields()
    }
    return () => setNeedErrorMessage(false)
  }, [error, form, needErrorMessage])

  useEffect(() => {
    if (updateData?.user?.token && updateData?.user?.username) {
      dispatch(setLogInStatus({ newToken: updateData.user.token, username: updateData.user.username }))
      message.success('success')
      history.goBack()
    }
  }, [dispatch, history, updateData])

  const onFinish = ({ email, image, password, username }: IForm) => {
    const obj = {
      user: {
        username,
        email,
        password,
        image,
      },
    }
    updateUser(obj)
  }

  return (
    <SmallFormWrapper header="Edit Profile">
      <Form
        form={form}
        layout="vertical"
        initialValues={{ username: data?.user.username, email: data?.user.email, image: data?.user.image }}
        scrollToFirstError
        autoComplete="off"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            { required: true },
            { min: 3 },
            { max: 20 },
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
          <Input />
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
          <Input />
        </Form.Item>

        <Form.Item
          label="New password"
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
          <Input.Password placeholder="New password" />
        </Form.Item>

        <Form.Item
          label="Avatar image (url)"
          name="image"
          rules={[
            { type: 'url' },
            () => ({
              validator(_, value) {
                const err = error as any
                if (err?.data?.errors?.image && value === originalArgs?.user.image)
                  return Promise.reject(new Error(err.data.errors.image))
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input placeholder="Avatar image" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isUpdateLoading}>
            Save
          </Button>
        </Form.Item>
      </Form>

      {error && needErrorMessage && (
        <Alert message="Error" description={makeErrorMessage(error)} type="error" showIcon />
      )}
    </SmallFormWrapper>
  )
}
