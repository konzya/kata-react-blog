import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { message } from 'antd'
import ArticleForm, { IArticleForm } from '../ArticleForm/ArticleForm'
import { useCreateArtilceMutation } from '../../features/api/apiSlice'
import styles from './CreateArticlePage.module.scss'

export default function CreateArticlePage() {
  const [postArticle, { error, isLoading, data, originalArgs }] = useCreateArtilceMutation()
  const history = useHistory()
  const onFinish = (values: IArticleForm) => {
    const obj = {
      article: {
        ...values,
      },
    }
    obj.article.tagList = obj.article.tagList.filter((tag: string) => !!tag)
    postArticle(obj)
  }

  useEffect(() => {
    if (data) {
      message.success('success')
      history.replace(`/articles/${data.slug}`)
    }
  }, [data, history])

  return (
    <main className={styles.page}>
      <ArticleForm
        onFinish={onFinish}
        initialValues={{}}
        header="Create new article"
        isLoading={isLoading}
        error={error}
        originalArgs={originalArgs}
      />
    </main>
  )
}
