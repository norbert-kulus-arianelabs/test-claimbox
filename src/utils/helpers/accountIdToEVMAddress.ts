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

import { AccountId } from "@hashgraph/sdk";
import MirrorNode from "@src/utils/services/MirrorNode";

export enum AddressType {
  Contract,
  Token,
  Account,
}

const toSolidityAddress = (value: string) =>
  value.startsWith("0x")
    ? value
    : `0x${AccountId.fromString(value).toSolidityAddress()}`;

export const accountIdToEVMAddress = async (value: string): Promise<string> => {
  try {
    value = value.toString();
    if (!value || value.startsWith("0x")) {
      return value;
    }
    return MirrorNode.getEvmAddressForAccount(value);
  } catch (e) {
    console.error(e);

    return toSolidityAddress(value);
  }
};
