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

import { Button } from "@src/components/shared/Button";
import { Tooltip } from "@src/components/shared/Tooltip";
import MirrorNode from "@src/utils/services/MirrorNode";
import { hederaIdToSolidityAddress } from "@src/utils/helpers/hederaIdToSolidityAddress";
import { RequiredAllowance } from "@src/utils/hooks/claiming/useClaiming";
import { useClaimingPageContext } from "@src/utils/hooks/claiming/useClaimingPageContext";
import useContractState from "@src/utils/hooks/contract/useContractState";
import useHederaWallets from "@src/utils/hooks/wallets/useHederaWallets";
import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { TokenId } from "@hashgraph/sdk";
import { setHbarDecimalsForEstimation } from "@src/utils/helpers/setHbarDecimalsForEstimation";
import { usersMintLimitError } from "@src/utils/constants/tooltipText";

export const ClaimingButton = ({
  symbol,
  price,
  token_id,
  userAllowancesGivenForContractToSpendFT,
  className,
  warningToolTipMessage,
}: RequiredAllowance & {
  className?: string;
  warningToolTipMessage?: string | React.ReactElement;
}) => {
  const { userWalletId } = useHederaWallets();
  const { nftCollectionOnChainMetadata, requiredAllowlistAddresses, isDataLoading } =
    useContractState();
  const [allowanceApproved, setAllowanceApproved] = useState<boolean>(false);
  const [firstClaimTryAfterApproval, setFirstClaimTryAfterApproval] =
    useState(false);
  const [
    isUserAssociatedWithClaimingCurrency,
    setIsUserAssociatedWithClaimingCurrency,
  ] = useState(false);
  const {
    checkIfIsAllowedToClaimWithFT,
    approveTokenAllowance,
    isAccountAssociatedToToken,
    claimToken,
    claimCounter: { claimingStatus, timeToDistributionStart },
    calculateGasForClaim,
    calculateGasWithRetry,
    gas,
    retriesCount: gasEstimationRetriesCount,
    userMintLimitExceeded,
  } = useClaimingPageContext();

  useEffect(() => {
    if (userAllowancesGivenForContractToSpendFT >= Number(price?.toNumber())) {
      setAllowanceApproved(true);
    }
  }, [price, userAllowancesGivenForContractToSpendFT]);

  const handleClaimToken = useCallback(
    async (price?: string, tokenId?: string) => {
      if (!nftCollectionOnChainMetadata?.token_id) {
        throw new Error("No token ID returned from contract!");
      }

      if (tokenId && price) {
        const isContractAllowedToSpendUserFungibleTokensResponse =
          await checkIfIsAllowedToClaimWithFT(tokenId, price);

        if (isContractAllowedToSpendUserFungibleTokensResponse) {
          setAllowanceApproved(true);
          return await claimToken(tokenId, price, requiredAllowlistAddresses);
        } else {
          const allowanceResult = await approveTokenAllowance(
            tokenId,
            price.toString()
          );
          setAllowanceApproved(allowanceResult);
          setFirstClaimTryAfterApproval(true);
          // after approved allowance claim will be cached by useEffect
          // after first successful gas estimation
          return;
        }
      }

      await claimToken(
        "0x0000000000000000000000000000000000000000",
        price,
        requiredAllowlistAddresses
      );
    },
    [
      approveTokenAllowance,
      checkIfIsAllowedToClaimWithFT,
      claimToken,
      nftCollectionOnChainMetadata?.token_id,
      requiredAllowlistAddresses,
    ]
  );

  const checkIfUserIsAssociatedWithClaimingCurrency = useCallback(async () => {
    if (price && symbol !== "HBAR" && token_id && userWalletId) {
      const isFTAssociatedWithUser =
        await MirrorNode.checkTokenAssociationStatus(token_id, userWalletId);

      setIsUserAssociatedWithClaimingCurrency(isFTAssociatedWithUser);
    }
  }, [price, symbol, token_id, userWalletId]);

  useEffect(() => {
    checkIfUserIsAssociatedWithClaimingCurrency();
  }, [checkIfUserIsAssociatedWithClaimingCurrency]);

  useEffect(() => {
    if (
      token_id &&
      price?.toString() &&
      gas.status === "success" &&
      gas.amount &&
      gasEstimationRetriesCount === 0 &&
      firstClaimTryAfterApproval
    ) {
      // this code will open wallet only once after approval and successful gas estimation
      setFirstClaimTryAfterApproval(false);
      claimToken(hederaIdToSolidityAddress(token_id), price?.toString());
    }
  }, [
    allowanceApproved,
    claimToken,
    firstClaimTryAfterApproval,
    gas,
    gasEstimationRetriesCount,
    price,
    token_id,
    isDataLoading
  ]);

  useEffect(() => {
    if (gas.status === "idle" && token_id && price && allowanceApproved) {
      const tokenAddress = TokenId.fromString(token_id).toSolidityAddress();
      calculateGasWithRetry(
        { paymentToken: tokenAddress, leaves: requiredAllowlistAddresses },
        { retriesIntervalMS: [2000, 5000] }
      );
    }

    if (
      gas.status === "idle" &&
      symbol === "HBAR" &&
      price &&
      isAccountAssociatedToToken
    ) {
      calculateGasWithRetry(
        {
          paymentToken: "0x0000000000000000000000000000000000000000",
          leaves: requiredAllowlistAddresses,
          payableValue: setHbarDecimalsForEstimation(price.toString()),
        },
        { retriesIntervalMS: [2000, 5000] }
      );
    }
  }, [
    allowanceApproved,
    calculateGasForClaim,
    calculateGasWithRetry,
    gas.status,
    isAccountAssociatedToToken,
    price,
    requiredAllowlistAddresses,
    symbol,
    token_id,
    isDataLoading
  ]);

  const renderTooltip = useCallback(
    (showClaimingCurrencyAssociatingError = false) => {
      let tooltipMessage: string | null | React.ReactElement = null;

      let tooltipClassName = clsx(
        "border-1 rounded-full w-6 h-6 flex text-center justify-center items-center text-white",
        warningToolTipMessage ? "bg-warning" : "bg-error"
      );

      if (warningToolTipMessage) {
        tooltipMessage = warningToolTipMessage;
      }

      if (claimingStatus === "countToStart") {
        tooltipMessage = `Claiming will begin at ${timeToDistributionStart}`;
      }

      if (claimingStatus === "expired") {
        tooltipMessage = "Claiming expired";
      }

      if (
        !isUserAssociatedWithClaimingCurrency &&
        showClaimingCurrencyAssociatingError
      ) {
        tooltipMessage = `You are not associated with ${symbol}`;
      }

      if (userMintLimitExceeded) {
        tooltipMessage = usersMintLimitError;
        tooltipClassName =
          "border-1 rounded-full w-6 h-6 flex text-center justify-center items-center text-white bg-warning";
      }

      if (tooltipMessage) {
        return (
          <Tooltip position="top" tooltip={tooltipMessage}>
            <span className={tooltipClassName}>!</span>
          </Tooltip>
        );
      }

      if (
        !tooltipMessage &&
        gas.amount === null &&
        gas.status === "success" &&
        (isUserAssociatedWithClaimingCurrency || symbol === "HBAR")
      ) {
        tooltipMessage = "This transaction will probably revert.";
        tooltipClassName =
          "border-1 rounded-full w-6 h-6 flex text-center justify-center items-center text-white bg-warning";

        return (
          <Tooltip position="top" tooltip={tooltipMessage}>
            <span className={tooltipClassName}>!</span>
          </Tooltip>
        );
      }
    },
    [
      claimingStatus,
      gas.amount,
      gas.status,
      isUserAssociatedWithClaimingCurrency,
      symbol,
      timeToDistributionStart,
      userMintLimitExceeded,
      warningToolTipMessage,
    ]
  );

  if (symbol === "HBAR" && price) {
    return (
      <Button
        className={className + " relative"}
        type="submit"
        disabled={
          !isAccountAssociatedToToken ||
          claimingStatus === "countToStart" ||
          claimingStatus === "expired"
        }
        onClick={async () => await handleClaimToken(price.toString())}
      >
        Claim
        <span className="absolute -top-2 -right-2 text-white">
          {renderTooltip()}
        </span>
      </Button>
    );
  }

  if (!token_id) {
    console.warn("No token ID returned from contract!");
    return null;
  }

  if (!price) {
    console.warn("No token price returned from contract!");
    return null;
  }

  return (
    <>
      <Button
        className={className + " relative"}
        type="submit"
        disabled={
          !isAccountAssociatedToToken ||
          claimingStatus === "countToStart" ||
          claimingStatus === "expired" ||
          !isUserAssociatedWithClaimingCurrency
        }
        onClick={() => {
          handleClaimToken(
            price?.toString(),
            hederaIdToSolidityAddress(token_id)
          );
        }}
      >
        {allowanceApproved ? "Claim" : "Approve and claim"}

        <span className="absolute -top-2 -right-2 text-white">
          {renderTooltip(true)}
        </span>
      </Button>
    </>
  );
};
