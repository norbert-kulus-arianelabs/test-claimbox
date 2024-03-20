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
import { CurrentPricePanel } from "@src/components/claiming-page/CurrentPricePanel";
import { DatePanel } from "@src/components/claiming-page/DatePanel";
import { Tooltip } from "@src/components/shared/Tooltip";
import {
  remainingDistributionTooltipText
} from "@src/utils/constants/tooltipText";
import useContractState from "@src/utils/hooks/contract/useContractState";

export const BasicInformation = ({
  tokenName,
  remainingDistributionAvailable,
  tokensDistributed,
}: Pick<
  ReturnType<typeof useContractState>,
  | "remainingDistributionAvailable"
  | "tokensDistributed"
> & {
  tokenName: string;
}) => {
  return (
    <div className='grid gap-y-5'>
      <h2 className="">{tokenName}</h2>

      <div className="flex w-full justify-between gap-4">
        <CurrentPricePanel />

        <div className="w-1/2">
          <div className="flex mb-1.5 items-center gap-1">
            <p className="text-[12px]">Remaining Distribution Available</p>
            <Tooltip tooltip={remainingDistributionTooltipText}>
              <TooltipIcon />
            </Tooltip>
          </div>

          {remainingDistributionAvailable ? (
            <h4 className="mb-1.5">{`${remainingDistributionAvailable} / ${
              remainingDistributionAvailable + tokensDistributed
            }`}</h4>
          ) : (
            <p>-</p>
          )}
        </div>
      </div>

      <DatePanel />
    </div>
  );
};
