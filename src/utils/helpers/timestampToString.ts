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

export const timestampToString = (timeStamp: number) => {
  const days = Math.floor(timeStamp / (3600 * 24));
  const hours = Math.floor((timeStamp % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeStamp % 3600) / 60);
  const seconds = Math.floor(timeStamp % 60);

  return `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
};
