import React from 'react'
import { List, Alert } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import makeErrorMessage from '../../helpers'
import Article from '../Article/Article'
import styles from './ArticlesPage.module.scss'
import { useGetArticlesQuery, PAGE_SIZE } from '../../features/api/apiSlice'

export default function ArticlesPage() {
  const { page }: { page: string } = useParams()
  const history = useHistory()
  const pageParam = Number(page)
  const { data, isFetching, isError, error } = useGetArticlesQuery(pageParam)
  return (
    <main className={styles.page}>
      {isError && <Alert message="Error" description={makeErrorMessage(error)} type="error" showIcon />}
      <List
        dataSource={data?.articles}
        loading={isFetching}
        renderItem={(article) => (
          <li key={article.slug}>
            <Article article={article} full={false} page={pageParam} />
          </li>
        )}
        pagination={{
          current: pageParam,
          hideOnSinglePage: true,
          pageSize: PAGE_SIZE,
          showSizeChanger: false,
          total: data?.articlesCount,
          size: 'small',
          onChange: (newPage) => {
            history.push(`/articles/page/${newPage}`)
            window.scrollTo(0, 0)
          },
        }}
      />
    </main>
  )
}
