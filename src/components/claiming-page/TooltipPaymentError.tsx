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

import { TokenWithInvalidTokenAmountResponse } from "@src/utils/types/TokenAmountVerificationResponse";

export const TooltipPaymentError: React.FC<{
  paymentErrorData: TokenWithInvalidTokenAmountResponse;
}> = ({ paymentErrorData }): string | React.ReactElement => {

  return (
    <>
      <div className="pb-2 text-center whitespace-nowrap">
        {`Will fail due to insufficient amount of ${paymentErrorData.data.symbol}`}
      </div>
      <div className="text-center whitespace-nowrap">
        {`You have only ${paymentErrorData.validationResponse.userBallance} ${paymentErrorData.data.symbol}`}
      </div>
    </>
  );
};
