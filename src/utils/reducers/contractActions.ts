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

import { TokenGatingRequiredToken } from "@src/utils/services/HDC";
import { DistributionDates } from "@src/utils/entity/NFTInfo";
import {
  Action,
  ContractStateActions,
} from "@src/utils/reducers/contractReducer";
import { TokenDataInterface } from "@src/utils/types/TokenDataInterface";

export const setRemainingDistributionAvailable = async (
  payload: number,
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_REMAINING_DISTRIBUTION,
    payload,
  });

export const setTokenGatingRequiredFungibleTokenList = async (
  payload: TokenGatingRequiredToken[],
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_TOKEN_GATING_REQUIRED_FUNGIBLE_TOKEN_LIST,
    payload,
  });

export const setTokenGatingRequiredNonFungibleTokenList = async (
  payload: TokenGatingRequiredToken[],
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_TOKEN_GATING_REQUIRED_NON_FUNGIBLE_TOKEN_LIST,
    payload,
  });

export const setMintLimit = async (
  payload: string,
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_MINT_LIMIT,
    payload,
  });

export const setPaymentEnabled = async (
  payload: boolean,
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_PAYMENT_ENABLED,
    payload,
  });

export const setTokensDistributed = async (
  payload: number,
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_TOKENS_DISTRIBUTED,
    payload,
  });

export const setTokensPriceData = async (
  payload: TokenDataInterface[],
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_TOKENS_PRICE_DATA,
    payload,
  });

export const setNFTCollectionOnChainMetadata = async (
  payload: TokenDataInterface,
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_NFT_COLLECTION_ON_CHAIN_METADATA,
    payload,
  });

export const setTokenGated = async (
  payload: boolean,
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_TOKEN_GATED,
    payload,
  });

export const setPreviewImage = async (
  payload: string | null,
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_PREVIEW_IMAGE,
    payload,
  });

export const setDistributionDates = async (
  payload: DistributionDates,
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_DISTRIBUTION_DATES,
    payload,
  });

export const setRequiredAllowlistAddresses = async (
  payload: string[],
  dispatch: React.Dispatch<Action>
) =>
  dispatch({
    type: ContractStateActions.SET_REQUIRED_ALLOWLIST_ADDRESSES,
    payload,
  });
