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
import { uniqueId } from "lodash";

export const RequiredToken = ({
  tokenSymbol,
  amount,
  tokenName,
  tokenId,
}: {
  tokenSymbol?: string;
  amount?: string;
  tokenName?: string;
  tokenId?: string;
}) => {
  return (
    <p
      key={uniqueId(`${tokenSymbol}-${tokenName}-${tokenId}`)}
      className="flex items-center text-s"
    >
      <span className="mr-1">{tokenId}</span>
      <span className="text-xs inline-flex">
        <span className="ml-1 mr-1">- Qty {amount}</span>{" "}
        <Tooltip
          tooltip={
            <>
              <p className="text-white  text-xs">
                <span className="font-bold">{tokenId}</span>
              </p>
              <p className="text-white  text-xs">
                Token name: <span className="font-bold">{tokenName}</span>
              </p>
              <p className="text-white text-xs">
                Token Symbol: <span className="font-bold">{tokenSymbol}</span>
              </p>
            </>
          }
        >
          <TooltipIcon />
        </Tooltip>
      </span>
    </p>
  );
};
