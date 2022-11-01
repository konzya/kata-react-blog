import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Tag, Avatar, Button, Popover, message } from 'antd'
import { nanoid } from '@reduxjs/toolkit'
import { Link, useHistory } from 'react-router-dom'
import { parseISO, format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types'
import { selectLoggedUser } from '../../features/app/appSlice'
import { useAppSelector } from '../../app/hooks'
import styles from './Article.module.scss'
import alert from './Vector.svg'
import {
  IArticle,
  useDeleteArtilceMutation,
  useFavoriteArticleMutation,
  useUnfavoriteArticleMutation,
} from '../../features/api/apiSlice'
import makeErrorMessage from '../../helpers'

export default function Article({ article, full, page }: { article: IArticle; full: boolean; page: number }) {
  const { title, favoritesCount, tagList, author, createdAt, description, body, favorited, slug } = article
  const loggedUser = useAppSelector(selectLoggedUser)
  const [favorite, { error: favErr, isSuccess: favSucc, isLoading: favLoading }] = useFavoriteArticleMutation()
  const [unfavorite, { error: unFavErr, isSuccess: inFavSucc, isLoading: unFavLoading }] =
    useUnfavoriteArticleMutation()
  const history = useHistory()
  const [deleteArticle, { isSuccess: deleteSuccess, error: deleteError, isLoading: isDeleteLoading }] =
    useDeleteArtilceMutation()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [favCount, setFavCount] = useState(favoritesCount)
  const timerId = useRef<TimeoutId>()

  const favIfNeeded = (checked: boolean) => {
    if (favLoading || unFavLoading) {
      clearTimeout(timerId.current)
      timerId.current = setTimeout(() => favIfNeeded(checked), 200)
      return
    }
    if (checked === favorited) return
    if (checked) favorite({ slug, page })
    if (!checked) unfavorite({ slug, page })
  }

  const onFavorite = (e: ChangeEvent<HTMLInputElement>) => {
    clearTimeout(timerId.current)
    if (e.target.checked) {
      setFavCount((prev) => {
        const next = prev + 1
        return next
      })
    }
    if (!e.target.checked) {
      setFavCount((prev) => {
        const next = prev - 1
        return next
      })
    }
    timerId.current = setTimeout(() => favIfNeeded(e.target.checked), 200)
    e.target.blur()
  }

  const hidePopover = () => {
    setPopoverOpen(false)
  }

  const handlePopoverChange = (newOpen: boolean) => {
    setPopoverOpen(newOpen)
  }

  useEffect(() => {
    if (deleteSuccess) history.goBack()
  }, [deleteSuccess, history])

  useEffect(() => {
    if (deleteError) message.error(makeErrorMessage(deleteError))
  }, [deleteError])

  useEffect(() => {
    if (favErr) message.error('Favorite failed')
    if (favSucc) message.success('Favorite success')
  }, [favErr, favSucc])

  useEffect(() => {
    if (unFavErr) message.error('Unfavorite failed')
    if (inFavSucc) message.success('Unfavorite success')
  }, [inFavSucc, unFavErr])

  const date = format(parseISO(createdAt), 'MMMM d, yyyy')

  const popoverContent = (
    <div className={styles.popover}>
      <header className={styles.popover__header}>
        <img className={styles.popover__alert} src={alert} alt="alert" />
        <span className={styles.popover__message}>Are you sure to delete this article?</span>
      </header>
      <div className={styles.popover__buttons}>
        <Button className={styles.popover__button} onClick={() => hidePopover()}>
          No
        </Button>
        <Button
          className={styles.popover__button}
          type="primary"
          loading={isDeleteLoading}
          onClick={() => deleteArticle(slug)}
        >
          Yes
        </Button>
      </div>
    </div>
  )

  const editButtons = (
    <div className={styles['article__flex-wrapper']}>
      <Popover
        placement="rightTop"
        trigger="click"
        content={popoverContent}
        open={popoverOpen}
        onOpenChange={handlePopoverChange}
      >
        <Button className={`${styles.article__button} ${styles['article__button--delete']}`}>Delete</Button>
      </Popover>
      <Link to={`/articles/${slug}/edit`}>
        <Button className={`${styles.article__button} ${styles['article__button--edit']}`}>Edit</Button>{' '}
      </Link>
    </div>
  )

  return (
    <article className={styles.article}>
      <section className={styles.article__preview}>
        <div className={styles['article__left-side']}>
          <header className={styles.article__header}>
            {full ? (
              <span className={styles.article__title}>{title || 'empty'}</span>
            ) : (
              <Link className={styles.article__link} to={`/articles/${slug}`}>
                <span className={`${styles.article__title} ${styles['article__title--preview']}`}>
                  {title || 'empty'}
                </span>
              </Link>
            )}

            <input
              className={styles.article__checkbox}
              type="checkbox"
              disabled={!loggedUser}
              onInput={onFavorite}
              defaultChecked={favorited}
            />

            <span className={styles.article__favorites}>{favCount}</span>
          </header>
          <ul className={styles['article__tag-list']}>
            {tagList.map((tag) => (
              <li key={nanoid()}>
                <Tag className={styles.article__tag}>{tag || 'empty'}</Tag>
              </li>
            ))}
          </ul>
          <p className={styles.article__description}>{description}</p>
        </div>
        <div className={styles['article__right-side']}>
          <div className={styles['article__flex-wrapper']}>
            <div className={styles.article__info}>
              <span className={styles.article__author}>{author.username}</span>
              <span className={styles.article__date}>{date}</span>
            </div>
            <Avatar className={styles.article__avatar} src={author.image} alt={author.username} />
          </div>

          {full && loggedUser === author.username && editButtons}
        </div>
      </section>

      {full && <ReactMarkdown className={styles.article__body}>{body}</ReactMarkdown>}
    </article>
  )
}
