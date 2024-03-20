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

import { convertContractAddress } from '@src/utils/helpers/convertContractAddress'

export const SMART_CONTRACT_ID_DECIMAL = import.meta.env
  .VITE_HEDERA_SMART_CONTRACT_ID as string

export const SMART_CONTRACT_ID_HEXADECIMAL = convertContractAddress(
  SMART_CONTRACT_ID_DECIMAL
)

export const HEDERA_NETWORK = import.meta.env.VITE_HEDERA_NETWORK as
  | 'testnet'
  | 'mainnet'
  | 'previewnet'

export const WALLET_CONFIG_NAME = import.meta.env
  .VITE_WALLET_CONFIG_NAME as string

export const WALLET_CONFIG_DESCRIPTION = import.meta.env
  .VITE_WALLET_CONFIG_DESCRIPTION as string

export const WALLET_CONFIG_ICON_URL = import.meta.env
  .VITE_WALLET_CONFIG_ICON_URL as string

export const WALLET_CONFIG_APP_URL = import.meta.env
  .VITE_WALLET_CONFIG_APP_URL as string
