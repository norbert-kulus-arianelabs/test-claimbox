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

import React from "react";
import { CloseIcon } from "@src/assets/icons/CloseIcon";
import { Button } from "@src/components/shared/Button";
import { clsx } from "clsx";

export interface ModalProps {
  open: boolean;
  handleOnOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  hideCross?: boolean;
}

export const Modal = ({
  children,
  open,
  handleOnOpenChange,
  hideCross,
}: ModalProps) => {
  const modalClassName = clsx(
    "relative flex flex-col w-[670px] z-50 bg-white rounded-[20px] pb-10 pt-7",
    open ? "flex" : "hidden"
  );

  const handleModalClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      className={
        open
          ? "fixed inset-0 flex items-center justify-center z-40 bg-backdrop"
          : "hidden"
      }
      onClick={() => handleOnOpenChange(false)}
    >
      <div className={modalClassName} onClick={handleModalClick}>
        {!hideCross ? (
          <div className="w-full px-1">
            <Button
              noBorder
              icon={<CloseIcon />}
              className="flex justify-center items-center px-3 py-2 ml-9 hover:bg-hover"
              onClick={() => handleOnOpenChange(false)}
              transparent
            />
          </div>
        ) : null}
        <div className="flex flex-col">{children}</div>
      </div>
    </div>
  );
};
