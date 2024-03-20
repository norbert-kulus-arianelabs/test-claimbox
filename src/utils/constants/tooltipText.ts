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

export const currentPriceTooltipText =
  "The current price is the cost to acquire one unit of this NFT.";
export const remainingDistributionTooltipText =
  "This indicates the number of tokens still available for distribution. Once all tokens are claimed, this distribution will close.";
export const dateTooltipText =
  "These dates mark the beginning and end of the token distribution period. Claims must be made within this timeframe.";
export const otherGuardsTooltipText =
  "Guards are additional security measures or conditions set for token distribution, such as wallet verification or specific user eligibility.";
export const NFTCollectionMetadataTooltipText =
  "This metadata includes the properties of the NFT stored on the blockchain, such as token ID, symbol, name, and the maximum supply available for minting.";
export const gatingWarningMessage = "Token Gate(s) not met:";
export const gatingWarningListElement = (
  requiredAmount: number,
  tokenId?: string
) => `- ${tokenId} - Qty ${requiredAmount}`;
export const usersMintLimitError =
  "You cannot mint more NFTs with this account.";
