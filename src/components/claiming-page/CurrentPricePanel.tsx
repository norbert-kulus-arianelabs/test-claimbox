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

import { TooltipIcon } from '@src/assets/icons/TooltipIcon'
import useContractState from '@src/utils/hooks/contract/useContractState'
import { Tooltip } from '@src/components/shared/Tooltip'
import { currentPriceTooltipText } from '@src/utils/constants/tooltipText'

export const CurrentPricePanel = () => {
  const { tokensPriceData } = useContractState()

  return (
    <>
      <div className='w-1/2'>
        <div className='flex mb-1.5 items-center gap-1'>
          <p className='text-[12px]'>Current Price</p>
          <Tooltip tooltip={currentPriceTooltipText}>
            <TooltipIcon />
          </Tooltip>
        </div>
        {tokensPriceData.length > 0 ? (
          tokensPriceData.map((token, index) => (
            <h4 className='mb-1.5' key={index}>
              {`${token.price?.toFixed()} ${token.symbol}`}
            </h4>
          ))
        ) : (
          <p>FREE</p>
        )}
      </div>
    </>
  )
}
