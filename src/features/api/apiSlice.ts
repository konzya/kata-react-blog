import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface IArticle {
  slug: string
  title: string
  description: string
  body: string
  tagList: string[]
  createdAt: string
  updatedAt: string
  favorited: boolean
  favoritesCount: number
  author: {
    username: string
    bio: string
    image: string
    following: boolean
  }
}

export interface INewArticle {
  slug?: string
  article: {
    title: string
    description: string
    body: string
    tagList?: string[]
  }
}

export interface IUser {
  user: {
    email?: string
    token?: string
    username?: string
    password?: string
    bio?: string
    image?: string
  }
}

interface ListPosts {
  articles: IArticle[]
  articlesCount: number
}

export const PAGE_SIZE = 13

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://blog.kata.academy/api',
    prepareHeaders(headers, api) {
      const state = api.getState() as any
      if (state.app.loggedUser) {
        const token = localStorage.getItem('token')
        headers.append('Authorization', `Token ${token}`)
      }
      return headers
    },
  }),
  refetchOnReconnect: true,
  tagTypes: ['Article', 'User'],
  endpoints: (builder) => ({
    getArticles: builder.query<ListPosts, number>({
      query: (page) => `/articles?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}`,
      providesTags: ['Article'],
      keepUnusedDataFor: 0,
    }),
    getArticle: builder.query<IArticle, string>({
      query: (slug) => `/articles/${slug}`,
      transformResponse: (rawResult: { article: IArticle }) => rawResult.article,
      providesTags: (result, error, slug) => [{ type: 'Article', slug }],
      keepUnusedDataFor: 0,
    }),
    createArtilce: builder.mutation<IArticle, INewArticle>({
      query: (body) => ({
        url: '/articles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Article'],
      transformResponse: (rawResult: { article: IArticle }) => rawResult.article,
    }),
    editArtilce: builder.mutation<IArticle, INewArticle>({
      query: (body) => ({
        url: `/articles/${body.slug}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, body) => [{ type: 'Article', slug: body.slug }],
      transformResponse: (rawResult: { article: IArticle }) => rawResult.article,
    }),
    deleteArtilce: builder.mutation<void, string>({
      query: (slug) => ({
        url: `/articles/${slug}`,
        method: 'DELETE',
      }),
    }),
    signIn: builder.mutation<IUser, IUser>({
      query: (body) => ({
        url: '/users/login',
        method: 'POST',
        body,
      }),      
    }),
    signUp: builder.mutation<IUser, IUser>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),      
    }),
    getCurrentUser: builder.query<IUser, void>({
      query: () => ({
        url: '/user',
      }),
      providesTags: ['User'],
    }),
    updateCurrentUser: builder.mutation<IUser, IUser>({
      query: (body) => ({
        url: '/user',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    favoriteArticle: builder.mutation<IArticle, { slug: string; page: number }>({
      query: ({ slug }) => ({
        url: `articles/${slug}/favorite`,
        method: 'POST',
      }),
      async onQueryStarted({ slug, page }, { dispatch, queryFulfilled }) {
        if (page === 0) {
          const patchResult = dispatch(
            apiSlice.util.updateQueryData('getArticle', slug, (draft) => {
              const post = draft
              if (post) {
                post.favoritesCount += 1
                post.favorited = true
              }
            })
          )
          try {
            await queryFulfilled
          } catch {
            patchResult.undo()
          }
        }
        if (page) {
          const patchResult = dispatch(
            apiSlice.util.updateQueryData('getArticles', page, (draft) => {
              const post = draft.articles.find((article) => article.slug === slug)
              if (post) {
                post.favoritesCount += 1
                post.favorited = true
              }
            })
          )
          try {
            await queryFulfilled
          } catch {
            patchResult.undo()
          }
        }
      },
    }),
    unfavoriteArticle: builder.mutation<IArticle, { slug: string; page: number }>({
      query: ({ slug }) => ({
        url: `articles/${slug}/favorite`,
        method: 'DELETE',
      }),
      async onQueryStarted({ slug, page }, { dispatch, queryFulfilled }) {
        if (page === 0) {
          const patchResult = dispatch(
            apiSlice.util.updateQueryData('getArticle', slug, (draft) => {
              const post = draft
              if (post) {
                post.favoritesCount -= 1
                post.favorited = false
              }
            })
          )
          try {
            await queryFulfilled
          } catch {
            patchResult.undo()
          }
        }
        if (page) {
          const patchResult = dispatch(
            apiSlice.util.updateQueryData('getArticles', page, (draft) => {
              const post = draft.articles.find((article) => article.slug === slug)
              if (post) {
                post.favoritesCount -= 1
                post.favorited = false
              }
            })
          )
          try {
            await queryFulfilled
          } catch {
            patchResult.undo()
          }
        }
      },
    }),
  }),
})

export const {
  useGetArticlesQuery,
  useGetArticleQuery,
  useSignInMutation,
  useSignUpMutation,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useFavoriteArticleMutation,
  useUnfavoriteArticleMutation,
  useCreateArtilceMutation,
  useEditArtilceMutation,
  useDeleteArtilceMutation,
} = apiSlice
