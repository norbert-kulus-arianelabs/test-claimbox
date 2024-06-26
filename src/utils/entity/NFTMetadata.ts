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

interface FileMetadata {
  uri: string
  type: string
  metadata: NFTMetadata
}

export interface Properties {
  label: string
  value: string
}
export interface Attribute {
  trait_type: string
  value: string
}

interface Localization {
  uri: string
  locale: string
}

export interface NFTMetadata {
  name: string
  creator?: string
  description?: string
  image?: string | null
  type?: string
  files?: FileMetadata[]
  format?: string
  properties?: Properties[]
  attributes?: Attribute[]
  localization?: Localization
}
