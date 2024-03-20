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

import useContractState from "@src/utils/hooks/contract/useContractState";
import { RequiredToken } from "@src/components/claiming-page/other-guards/RequiredToken";
import map from "lodash/map";

export const TokenGating = ({
  tokenGated,
  tokenGatingRequiredFungibleTokenList,
  tokenGatingRequiredNonFungibleTokenList,
}: Pick<
  ReturnType<typeof useContractState>,
  | "tokenGated"
  | "tokenGatingRequiredFungibleTokenList"
  | "tokenGatingRequiredNonFungibleTokenList"
>) => {
  return (
    <div className="grid grid-cols-2 gap-y-2 mt-2">
      <div>
        <h4 className="text-gray">Token Gated</h4>
        {tokenGated && (
          <p className="ml-1.5 italic text-[13px] font-semibold">
            User must hold all the gated tokens
          </p>
        )}
      </div>
      <div>
        <p className="mr-6">{tokenGated ? "" : "No"}</p>
      </div>
      {tokenGatingRequiredFungibleTokenList.length > 0 && (
        <>
          <h4 className="text-black bold list-inside ml-4">• Fungible Tokens</h4>
          <div className="flex-col">
            {map(
              tokenGatingRequiredFungibleTokenList,
              ({ tokenData: { name, token_id, symbol }, amount }) => (
                <RequiredToken
                  tokenName={name}
                  tokenId={token_id}
                  tokenSymbol={symbol}
                  amount={amount}
                />
              )
            )}
          </div>
        </>
      )}

      {tokenGatingRequiredNonFungibleTokenList.length > 0 && (
        <>
          <h4 className="text-black list-inside ml-4">• Non Fungible Tokens</h4>

          <div>
            {map(
              tokenGatingRequiredNonFungibleTokenList,
              ({ tokenData: { name, token_id, symbol }, amount }) => (
                <RequiredToken
                  tokenName={name}
                  tokenId={token_id}
                  tokenSymbol={symbol}
                  amount={amount}
                />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};
