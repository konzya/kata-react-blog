import { Alert, Spin, message } from 'antd'
import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { useGetArticleQuery, useEditArtilceMutation } from '../../features/api/apiSlice'
import { selectLoggedUser } from '../../features/app/appSlice'
import makeErrorMessage from '../../helpers'
import ArticleForm, { IArticleForm } from '../ArticleForm/ArticleForm'
import styles from './EditArticlePage.module.scss'

export default function EditArticlePage() {
  const { slug }: { slug: string } = useParams()
  const history = useHistory()
  const { data, isSuccess, isError, error, isLoading } = useGetArticleQuery(slug)
  const [editArticle, { error: editError, data: editData, isLoading: isEditLoading, originalArgs }] =
    useEditArtilceMutation()
  let initialValues = {}
  const loggedUSer = useAppSelector(selectLoggedUser)
  if (data) {
    if (loggedUSer !== data.author.username) history.push(`/articles/${slug}`)
    const { body, description, tagList, title } = data
    initialValues = {
      title,
      body,
      description,
      tagList,
    }
  }

  useEffect(() => {
    if (editData) {
      message.success('success')
      history.goBack()
    }
  }, [history, editData])

  const onFinish = (values: IArticleForm) => {
    const obj = {
      slug,
      article: {
        ...values,
      },
    }
    obj.article.tagList = obj.article.tagList.filter((tag: string) => !!tag)
    editArticle(obj)
  }

  return (
    <main className={styles.page}>
      {isLoading && <Spin />}
      {isError && <Alert message="Error" description={makeErrorMessage(error)} type="error" showIcon />}
      {isSuccess && (
        <ArticleForm
          originalArgs={originalArgs}
          onFinish={onFinish}
          initialValues={initialValues}
          header="Edit Article"
          isLoading={isEditLoading}
          error={editError}
        />
      )}
    </main>
  )
}
