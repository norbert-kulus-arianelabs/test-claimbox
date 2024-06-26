/*
 * Hedera Claimbox NFT Claim Page
 *
 * Copyright (C) 2023 - 2024 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { useCallback, useEffect, useState } from 'react'

export default function useLocalStorage(
  key: string
): [string | undefined, (newValue: string | undefined) => void] {
  const [value, setValue] = useState<string | undefined>(
    localStorage.getItem(key) ?? undefined
  )

  const saveValue = useCallback(
    (newValue: string | undefined): void => {
      if (!newValue) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, newValue)
      }
      setValue(newValue)
    },
    [key]
  )

  const handleStorageChange = useCallback(() => {
    setValue(localStorage.getItem(key) ?? undefined)
  }, [key])

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [handleStorageChange])

  return [value, saveValue]
}
