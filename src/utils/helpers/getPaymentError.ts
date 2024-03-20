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

import { RequiredAllowance } from "@src/utils/hooks/claiming/useAccountAvailabilities";
import { TokenWithInvalidTokenAmountResponse } from "@src/utils/types/TokenAmountVerificationResponse";

export const getPaymentError = (
  paymentErrors: TokenWithInvalidTokenAmountResponse[],
  tokenToSelect?: RequiredAllowance | null
): TokenWithInvalidTokenAmountResponse | undefined => {
  return paymentErrors.find(
    ({ data }) => tokenToSelect?.token_id === data?.token_id
  );
};
