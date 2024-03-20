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

import clsx from 'clsx'
import React, { useRef } from 'react'

interface TooltipProps {
  children: React.ReactNode
  tooltip?: string | React.ReactElement,
  position?: 'top' | 'bottom'
}

export const Tooltip: React.FC<TooltipProps> = ({ children, tooltip, position = 'bottom' }): JSX.Element => {
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const container = useRef<HTMLDivElement>(null)

  const onMouseHandler = ({ clientX }: { clientX: number }) => {
    if (!tooltipRef.current || !container.current) return
    const { left } = container.current.getBoundingClientRect()
    tooltipRef.current.style.left = `${clientX - left}px`
  }

  const className = clsx(
    "absolute min-w-[150px] invisible opacity-0 group-hover:visible group-hover:opacity-100 transition bg-secondary text-textDefault text-[12px] px-2 py-1 rounded break-words",
    position === 'top' ? 'bottom-full -ml-4 mb-0.5' : 'top-full mt-2'
  );

  return (
    <div ref={container} onMouseEnter={onMouseHandler} className='group relative'>
      {children}
      {tooltip ? (
        <span
          ref={tooltipRef}
          className={className}>
         <div className='m-2'>{tooltip}</div> 
        </span>
      ) : null}
    </div>
  )
}
