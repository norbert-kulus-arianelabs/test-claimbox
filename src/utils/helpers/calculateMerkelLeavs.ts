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

import { accountIdToEVMAddress } from "@src/utils/helpers/accountIdToEVMAddress";
import MirrorNode from "@src/utils/services/MirrorNode";
import MerkleTree from "merkletreejs";
import { keccak256 } from "web3-utils";

export const calculateMerkelLeaves = async (
  requiredAllowlistAddresses: string[]
) => {
  const evmAddresses = (
    await Promise.all(
      requiredAllowlistAddresses.map((accountId) => {
        return MirrorNode.getAccountDetails(accountId);
      })
    )
  ).map(({ evm_address }) => evm_address);
  return evmAddresses.map((address) => {
    return keccak256(
      Buffer.from(address.replace("0x", ""), "hex") as unknown as string
    );
  });
};

export const calculateMerkelProof = async (
  leaves: string[],
  walletId: string
): Promise<string[]> => {
  const accountAddress = await accountIdToEVMAddress(walletId);
  const merkelLeaves =
    leaves.length > 0 ? await calculateMerkelLeaves(leaves) : [];

  const leaf = keccak256(
    Buffer.from(accountAddress.replace("0x", ""), "hex") as unknown as string
  );

  const merkleProof = new MerkleTree(merkelLeaves, keccak256, {
    sortPairs: true,
  });
  return merkleProof.getHexProof(leaf);
};
