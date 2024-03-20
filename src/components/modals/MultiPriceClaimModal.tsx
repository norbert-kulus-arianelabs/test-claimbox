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

import { ClaimingButton } from "@src/components/claiming-page/buttons/ClaimingButton";
import { Button } from "@src/components/shared/Button";
import { Checkbox } from "@src/components/shared/Checkbox";
import { Modal } from "@src/components/shared/Modal";
import { useModal } from "@src/utils/hooks/useModal";
import uniqueId from "lodash/uniqueId";
import map from "lodash/map";
import React from "react";
import { useCallback, useEffect, useState } from "react";
import { RequiredAllowance } from "@src/utils/hooks/claiming/useClaiming";
import { useClaimingPageContext } from "@src/utils/hooks/claiming/useClaimingPageContext";
import useContractState from "@src/utils/hooks/contract/useContractState";
import { TokenId } from "@hashgraph/sdk";
import { setHbarDecimalsForEstimation } from "@src/utils/helpers/setHbarDecimalsForEstimation";
import { TokenWithInvalidTokenAmountResponse } from "@src/utils/types/TokenAmountVerificationResponse";
import {  getPaymentError } from "@src/utils/helpers/getPaymentError";
import { TooltipPaymentError } from "@src/components/claiming-page/TooltipPaymentError";

const generateLabel = (
  tokenToSelect: RequiredAllowance,
  paymentErrorData?: TokenWithInvalidTokenAmountResponse
): string => {
  if (paymentErrorData) {
    return `${tokenToSelect.price} ${tokenToSelect.symbol} Your current balance = ${paymentErrorData.validationResponse.userBallance} [${paymentErrorData.data.symbol}]`;
  }

  return `${tokenToSelect.price} ${tokenToSelect.symbol}`;
};


export const MultiPriceClaimModal: React.FC<{
  prices: RequiredAllowance[];
  warningToolTipMessage?: string | React.ReactElement;
}> = ({ prices, warningToolTipMessage }) => {
  const {
    calculateGasForClaim,
    resetGas,
    checkIfIsAllowedToClaimWithFT,
    invalidPaymentTokens,
  } = useClaimingPageContext();
  const { requiredAllowlistAddresses } = useContractState();
  const [selectedPrice, setSelectedPrice] = useState<null | RequiredAllowance>(
    null
  );
  const { modalOpen, toggleModal } = useModal("MultiPriceClaimModal");
  const [error, setError] = useState<null | string>(null);

  const paymentError = getPaymentError(invalidPaymentTokens, selectedPrice);
  const tooltipPaymentError = paymentError && <TooltipPaymentError paymentErrorData={paymentError} />

  const handleNoPriceSelected = useCallback(() => {
    setError("Please choose your currency");
  }, []);

  useEffect(() => {
    if (error && selectedPrice) {
      setError(null);
    }
  }, [error, selectedPrice]);

  const calculateGas = async (price: RequiredAllowance) => {
    resetGas();
    if (price) {
      if (!price?.token_id) {
        calculateGasForClaim(
          "0x0000000000000000000000000000000000000000",
          requiredAllowlistAddresses,
          setHbarDecimalsForEstimation(price.price?.toString())
        );
      } else {
        const isAllowedToClaim = await checkIfIsAllowedToClaimWithFT(
          price?.token_id,
          price.toString()
        );

        if (isAllowedToClaim) {
          const tokenAddress = TokenId.fromString(
            price?.token_id
          ).toSolidityAddress();
          calculateGasForClaim(tokenAddress, requiredAllowlistAddresses);
        } else {
          resetGas();
        }
      }
    }
  };

  return (
    <Modal hideCross open={modalOpen} handleOnOpenChange={toggleModal}>
      <div className="max-w-[446px] mx-auto mb-10 flex flex-col justify-center items-center gap-3.5 text-center">
        <h2>Choose preferred currency</h2>
      </div>
      <div className="flex flex-col  mx-auto justify-center w-full px-28">
        <div className="grid  max-w-[446px] mx-auto justify-center">
          {map(prices, (price) => (
            <Checkbox
              key={uniqueId(`${price.symbol}-${price.price}-${price.token_id}`)}
              name={price.symbol}
              checked={selectedPrice === price}
              label={generateLabel(
                price,
                getPaymentError(invalidPaymentTokens, price)
              )}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedPrice(price);
                  calculateGas(price);
                } else {
                  setSelectedPrice(null);
                }
              }}
            />
          ))}
        </div>
        <p className="mx-auto text-error min-h-[18.9px]">{error}</p>

        <div className="flex w-full justify-between pt-9">
          <Button transparent onClick={toggleModal}>
            Close
          </Button>
          {selectedPrice ? (
            <ClaimingButton
              {...selectedPrice}
              warningToolTipMessage={
                tooltipPaymentError || warningToolTipMessage
              }
            />
          ) : (
            <Button
              onClick={handleNoPriceSelected}
              type="button"
              warningToolTipMessage={warningToolTipMessage}
            >
              Claim
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
