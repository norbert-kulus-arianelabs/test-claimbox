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

import { Tooltip } from '@src/components/shared/Tooltip'
import clsx from 'clsx'
import { MouseEventHandler, ReactElement } from 'react'

interface ButtonProps {
  label?: string
  className?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  icon?: ReactElement
  disabled?: boolean;
  noBorder?: boolean;
  children?: React.ReactNode;
  size?: 'small' | 'normal'
  type?: 'button' | 'submit',
  transparent?: boolean,
  warningToolTipMessage?: string | React.ReactElement,
}

export const Button: React.FC<ButtonProps> = ({
  label,
  className,
  onClick,
  icon,
  disabled,
  children,
  size,
  transparent,
  noBorder,
  type = 'button',
  warningToolTipMessage
}) => {
  const buttonClassName = clsx('relative',
    noBorder ? '' : 'border',
    transparent
      ? "bg-transparent border-secondary !text-secondary text-secondary"
      : "text-white",
    "focus:!outline focus:!outline-4 focus:!outline-secondary-100",
    disabled
      ? "bg-disabled !text-white hover:cursor-not-allowed border-disabled text-secondary"
      : "bg-secondary hover:bg-secondary-hover",
    "leading-[100%] group rounded transition-all duration-100 ease-in-out px-8 py-4",
    size === "small" && "px-1 py-[8px]"
  );

  return (
      <button
        disabled={disabled}
        className={clsx(buttonClassName, className ?? "")}
        onClick={onClick}
        type={type}
      >
        {icon && icon}
        {label && label}
        {children && children}
        {warningToolTipMessage && 
          <span className="absolute -top-2 -right-2 text-white">
            <Tooltip position="top" tooltip={warningToolTipMessage}>
              <span className="border-1 rounded-full bg-warning w-6 h-6 flex text-center justify-center items-center text-white">
                !
              </span>
            </Tooltip>
          </span>
        }
      </button>
  );
}
