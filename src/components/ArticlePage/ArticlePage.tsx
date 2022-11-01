import { Alert, Spin } from 'antd'
import React from 'react'
import { useParams } from 'react-router-dom'
import { useGetArticleQuery } from '../../features/api/apiSlice'
import makeErrorMessage from '../../helpers'

import Article from '../Article/Article'
import styles from './ArticlePage.module.scss'

export default function ArticlePage() {
  const { slug }: { slug: string } = useParams()
  const { data, error, isFetching } = useGetArticleQuery(slug)

  return (
    <main className={styles.page}>
      {isFetching && <Spin />}
      {error && <Alert message={makeErrorMessage(error)} type="error" showIcon />}
      {data && <Article article={data} full page={0} />}
    </main>
  )
}
