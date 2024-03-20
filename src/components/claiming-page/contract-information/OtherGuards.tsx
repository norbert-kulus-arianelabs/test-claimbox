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

import { TooltipIcon } from "@src/assets/icons/TooltipIcon";
import { Tooltip } from "@src/components/shared/Tooltip";
import { otherGuardsTooltipText } from "@src/utils/constants/tooltipText";
import useContractState from "@src/utils/hooks/contract/useContractState";
import { TokenGating } from "@src/components/claiming-page/other-guards/TokenGating";

export const OtherGuards = ({
  tokenGated,
  tokenGatingRequiredFungibleTokenList,
  tokenGatingRequiredNonFungibleTokenList,
  mintLimit,
}: Pick<
  ReturnType<typeof useContractState>,
  | "tokenGated"
  | "tokenGatingRequiredFungibleTokenList"
  | "tokenGatingRequiredNonFungibleTokenList"
  | "mintLimit"
>) => {
  return (
    <div>
      <div className="flex mb-1.5 items-center gap-2">
        <p className="text-[12px]">Other Guards</p>
        <Tooltip tooltip={otherGuardsTooltipText}>
          <TooltipIcon />
        </Tooltip>
      </div>

      <div className="grid grid-cols-2 gap-y-2 mt-1">
        <h4 className='text-gray'>Mint Limit</h4>
        <p>{mintLimit !== '0' && mintLimit !== '' ? `Maximum of ${mintLimit} NFT per user` : "None"}</p>
      </div>

      <TokenGating
        tokenGated={tokenGated}
        tokenGatingRequiredFungibleTokenList={
          tokenGatingRequiredFungibleTokenList
        }
        tokenGatingRequiredNonFungibleTokenList={
          tokenGatingRequiredNonFungibleTokenList
        }
      />
    </div>
  );
};
