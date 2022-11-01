import React from 'react'
import styles from './SmallFormWrap.module.scss'

interface MyProps {
  header: string
}

export default function SmallFormWrapper(props: React.PropsWithChildren<MyProps>) {
  const { children, header } = props

  return (
    <main className={styles.page}>
      <section className={styles.page__body}>
        <h1 className={styles.page__header}>{header}</h1>
        {children}
      </section>
    </main>
  )
}
