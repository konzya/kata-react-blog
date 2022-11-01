import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { Alert, Button, Form, Input } from 'antd'
import React, { useEffect, useState } from 'react'
import { INewArticle } from '../../features/api/apiSlice'
import makeErrorMessage from '../../helpers'
import styles from './ArticleForm.module.scss'

interface InitialValues {
  title: string
  description: string
  body: string
  tagList?: string[]
}

export interface IArticleForm {
  title: string
  description: string
  body: string
  tagList: string[]
}

export default function ArticleForm({
  initialValues,
  header,
  onFinish,
  isLoading,
  error,
  originalArgs,
}: {
  initialValues: InitialValues | {}
  header: string
  onFinish: (values: IArticleForm) => void
  isLoading: boolean
  error: FetchBaseQueryError | SerializedError | undefined
  originalArgs: INewArticle | undefined
}) {
  const [form] = Form.useForm<IArticleForm>()
  const initVal = { ...initialValues }
  const [needErrorMessage, setNeedErrorMessage] = useState(false)
  if (initVal.tagList?.length === 0 || !initVal.tagList) initVal.tagList = ['']

  useEffect(() => {
    if (error) {
      const err = error as any
      if (!err?.data?.errors?.title && !err?.data?.errors?.description && !err?.data?.errors?.body)
        setNeedErrorMessage(true)
      form.validateFields()
    }
    return () => setNeedErrorMessage(false)
  }, [error, form, needErrorMessage])

  return (
    <section className={styles.form}>
      <h2 className={styles.form__header}>{header}</h2>
      <Form
        form={form}
        initialValues={initVal}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        scrollToFirstError
        requiredMark={false}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true },
            () => ({
              validator(_, value) {
                const err = error as any
                if (err?.data?.errors?.title && value === originalArgs?.article.title)
                  return Promise.reject(new Error(err.data.errors.title))
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input placeholder="Title" />
        </Form.Item>

        <Form.Item
          label="Short description"
          name="description"
          rules={[
            { required: true },
            () => ({
              validator(_, value) {
                const err = error as any
                if (err?.data?.errors?.description && value === originalArgs?.article.description)
                  return Promise.reject(new Error(err.data.errors.description))
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input placeholder="Description" />
        </Form.Item>

        <Form.Item
          label="Text"
          name="body"
          rules={[
            { required: true },
            () => ({
              validator(_, value) {
                const err = error as any
                if (err?.data?.errors?.body && value === originalArgs?.article.body)
                  return Promise.reject(new Error(err.data.errors.body))
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input.TextArea placeholder="Text" rows={7} />
        </Form.Item>

        <Form.List name="tagList">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item key={field.key} noStyle>
                  <div className={styles['tag-list__item']}>
                    <Form.Item {...field} noStyle>
                      <Input placeholder="Tag" />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <Button
                        className={`${styles.button} ${styles['button--delete']}`}
                        onClick={() => remove(field.name)}
                      >
                        Delete
                      </Button>
                    ) : null}
                    {index === fields.length - 1 ? (
                      <Button
                        className={`${styles.button} ${styles['button--add']}`}
                        onClick={() => {
                          add()
                          window.scrollTo(0, document.body.scrollHeight)
                          setTimeout(() => form.getFieldInstance(`tagList_${field.name + 1}`).focus(), 0)
                        }}
                      >
                        Add tag
                      </Button>
                    ) : null}
                  </div>
                </Form.Item>
              ))}
            </>
          )}
        </Form.List>

        <Form.Item noStyle>
          <Button
            className={`${styles.button} ${styles['button--submit']}`}
            type="primary"
            htmlType="submit"
            loading={isLoading}
          >
            Send
          </Button>
        </Form.Item>
      </Form>
      {error && needErrorMessage && (
        <Alert message="Error" description={makeErrorMessage(error)} type="error" showIcon />
      )}
    </section>
  )
}
