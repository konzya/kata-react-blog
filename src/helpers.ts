import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { SerializedError } from '@reduxjs/toolkit'


export default function makeErrorMessage(error: FetchBaseQueryError | SerializedError) {
  let errorMessage: string | undefined = ''  
  if ('status' in error) {
    if ('error' in error) {
      errorMessage = error.error
    } else {
      const err = error.data as any
      if (err.errors instanceof Object) {
        const entries = Object.entries(err.errors)
        entries.forEach((entry) => {  
          if (entry[1] instanceof Object) entry[1] = JSON.stringify(entry[1])       
          errorMessage += `${entry[0]}: ${entry[1]}, `
        })
      } else {
        errorMessage = JSON.stringify(err)
      }
    }
  } else errorMessage = error.message
  return errorMessage
}
