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
import { MultiPriceClaimModal } from "@src/components/modals/MultiPriceClaimModal";
import { Button } from "@src/components/shared/Button";
import { useClaimingPageContext } from "@src/utils/hooks/claiming/useClaimingPageContext";
import useContractState from "@src/utils/hooks/contract/useContractState";
import useHederaWallets from "@src/utils/hooks/wallets/useHederaWallets";
import { useModal } from "@src/utils/hooks/useModal";
import { useEffect, useMemo } from "react";
import useClaimCounter from "@src/utils/hooks/claiming/useClaimCounter";
import { TokenGatingWarning } from "@src/components/claiming-page/other-guards/TokenGatingWarning";
import { BigNumber } from "ethers";
import { getPaymentError } from "@src/utils/helpers/getPaymentError";
import { TooltipPaymentError } from "@src/components/claiming-page/TooltipPaymentError";
import { usersMintLimitError } from "@src/utils/constants/tooltipText";

export const ContractClaimingButton = () => {
  const { requiredAllowlistAddresses } = useContractState();
  const {
    claimToken,
    calculateGasWithRetry,
    invalidPaymentTokens,
    invalidGatingTokens,
    isAccountAssociatedToToken,
    requiredAllowances,
    gas,
    userMintLimitExceeded,
  } = useClaimingPageContext();
  const { toggleModal: toogleMultiPriceClaimModal } = useModal(
    "MultiPriceClaimModal"
  );
  const { userWalletId } = useHederaWallets();
  const { tokensPriceData, distributionDates, isDataLoading } = useContractState();

  const { claimingStatus } = useClaimCounter(distributionDates);

  const isFreeToClaim = useMemo(
    () => tokensPriceData.length <= 0,
    [tokensPriceData.length]
  );

  const gatingErrors = invalidGatingTokens.length ? (
    <TokenGatingWarning invalidTokens={invalidGatingTokens} />
  ) : undefined;
  const otherErrors =
    gas.status === "success" &&
    gas.amount === null &&
    isAccountAssociatedToToken &&
    !requiredAllowances.length
      ? "This transaction will probably revert."
      : undefined;

  const mintLimitError = userMintLimitExceeded
    ? usersMintLimitError
    : undefined;

  useEffect(() => {
    if (isFreeToClaim && gas.status === "idle" && isAccountAssociatedToToken) {
      calculateGasWithRetry(
        {
          paymentToken: "0x0000000000000000000000000000000000000000",
          leaves: requiredAllowlistAddresses,
          payableValue: BigNumber.from("0"),
        },
        { retriesIntervalMS: [2000, 5000]}
      );
    }
  }, [isDataLoading, gas, requiredAllowlistAddresses, userWalletId, isAccountAssociatedToToken, isFreeToClaim, calculateGasWithRetry]);

  if (!userWalletId) {
    return;
  }

  if (claimingStatus === "countToStart" || claimingStatus === "expired") {
    return;
  }

  if (isFreeToClaim) {
    return (
      <>
        <Button
          type="submit"
          className="mx-auto bg-black text-textDefault"
          disabled={!isAccountAssociatedToToken}
          onClick={async () =>
            await claimToken(
              "0x0000000000000000000000000000000000000000",
              undefined,
              requiredAllowlistAddresses
            )
          }
          warningToolTipMessage={mintLimitError || gatingErrors || otherErrors}
        >
          Claim for free
        </Button>
      </>
    );
  }

  if (requiredAllowances.length === 1) {
    const paymentError = getPaymentError(
      invalidPaymentTokens,
      requiredAllowances[0]
    );
    const paymentTooltipError = paymentError && (
      <TooltipPaymentError paymentErrorData={paymentError} />
    );
    return (
      <ClaimingButton
        className="w-max mx-auto"
        {...requiredAllowances[0]}
        warningToolTipMessage={
          mintLimitError || paymentTooltipError || gatingErrors || otherErrors
        }
      />
    );
  }

  return (
    <>
      <MultiPriceClaimModal
        prices={requiredAllowances}
        warningToolTipMessage={gatingErrors}
      />

      <Button
        className="mx-auto"
        disabled={!isAccountAssociatedToToken}
        onClick={toogleMultiPriceClaimModal}
        warningToolTipMessage={mintLimitError || gatingErrors}
      >
        Claim
      </Button>
    </>
  );
};
